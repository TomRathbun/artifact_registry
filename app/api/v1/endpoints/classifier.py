"""
Requirements Classifier API Endpoint
Uses LSTM model from requirements_classifier project to classify requirement quality
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from pathlib import Path
import re

# Try to import PyTorch - if not available, we'll use mock mode
try:
    import torch
    import torch.nn as nn
    import numpy as np
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    torch = None
    nn = None

router = APIRouter()


class ClassificationRequest(BaseModel):
    text: str


class ClassificationResponse(BaseModel):
    classifications: Dict[str, float]
    predictions: Dict[str, bool]
    mode: str  # "model" or "mock"


# LSTM Model Definition (matching the trained model architecture)
if TORCH_AVAILABLE:
    class LSTMClassifier(nn.Module):
        def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim, n_layers, dropout):
            super().__init__()
            self.embedding = nn.Embedding(vocab_size, embedding_dim)
            self.lstm = nn.LSTM(embedding_dim, hidden_dim, num_layers=n_layers,
                               dropout=dropout, batch_first=True)
            self.fc = nn.Linear(hidden_dim, output_dim)
            self.dropout = nn.Dropout(dropout)
            
        def forward(self, text):
            embedded = self.dropout(self.embedding(text))
            output, (hidden, cell) = self.lstm(embedded)
            hidden = self.dropout(hidden[-1])
            return self.fc(hidden)
else:
    LSTMClassifier = None



# Global variables for model and vocabulary
model = None
vocab = None
max_length = 100


def load_model_and_vocab():
    """Load the trained LSTM model and vocabulary"""
    global model, vocab
    
    if model is not None and vocab is not None:
        return
    
    if not TORCH_AVAILABLE:
        print("PyTorch not available - running in mock mode")
        return
    
    from app.core.config import settings
    import os
    
    try:
        # 1. Try explicit model path if configured
        if settings.CLASSIFIER_MODEL_PATH and settings.CLASSIFIER_MODEL_PATH.exists():
            model_path = settings.CLASSIFIER_MODEL_PATH
        else:
            # 2. Search in the classifier project directory
            project_dir = settings.CLASSIFIER_PROJECT_DIR
            
            # Prioritized list of model filenames to search for
            model_filenames = [
                "best_model.pth",      # New standard for "updated results"
                "lstm_model.pth",      # Legacy name
                "model/best_model.pth",
                "model/lstm_model.pth"
            ]
            
            model_path = None
            if project_dir.exists():
                for filename in model_filenames:
                    path = project_dir / filename
                    if path.exists():
                        model_path = path
                        break
            
            # 3. Last ditch: check current and parent directory
            if model_path is None:
                for filename in model_filenames:
                    path = Path(filename)
                    if path.exists():
                        model_path = path
                        break
        
        if model_path is None:
            raise FileNotFoundError(
                f"Classifier model file not found in {settings.CLASSIFIER_PROJECT_DIR}. "
                "Please place 'best_model.pth' in that directory or set CLASSIFIER_MODEL_PATH in .env"
            )
        
        print(f"Loading classifier model from: {model_path}")
        
        # Load checkpoint
        checkpoint = torch.load(str(model_path), map_location=torch.device('cpu'))
        
        # Initialize model with saved parameters
        vocab_size = checkpoint.get('vocab_size', 10000)
        embedding_dim = checkpoint.get('embedding_dim', 100)
        hidden_dim = checkpoint.get('hidden_dim', 256)
        output_dim = 5  # 5 classification categories
        n_layers = checkpoint.get('n_layers', 2)
        dropout = checkpoint.get('dropout', 0.5)
        
        model = LSTMClassifier(vocab_size, embedding_dim, hidden_dim, 
                              output_dim, n_layers, dropout)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()
        
        # Load vocabulary
        vocab = checkpoint.get('vocab', {})
        
    except Exception as e:
        print(f"Warning: Could not load LSTM model: {e}")
        # Model will remain None, and we'll return mock data
        pass


def preprocess_text(text: str) -> List[int]:
    """Preprocess text and convert to token indices"""
    # Simple tokenization (should match training preprocessing)
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    tokens = text.split()
    
    # Convert to indices
    if vocab is None:
        # Return dummy indices if vocab not loaded
        return [1] * min(len(tokens), max_length)
    
    indices = [vocab.get(token, vocab.get('<UNK>', 1)) for token in tokens]
    
    # Pad or truncate to max_length
    if len(indices) < max_length:
        indices += [0] * (max_length - len(indices))
    else:
        indices = indices[:max_length]
    
    return indices


@router.post("/classify", response_model=ClassificationResponse)
async def classify_requirement(request: ClassificationRequest):
    """
    Classify a requirement text using the LSTM model
    
    Returns probabilities for each classification category:
    - is_vague
    - is_compound
    - is_untestable
    - is_incomplete
    - is_poorly_structured
    """
    try:
        # Load model if not already loaded
        load_model_and_vocab()
        
        if model is None:
            # Use heuristic-based mock data if model couldn't be loaded
            text = request.text.lower()
            
            # Simple heuristics for demonstration
            vague_words = ['fast', 'user-friendly', 'easy', 'simple', 'good', 'bad', 'nice', 'appropriate', 'reasonable']
            compound_indicators = [' and ', ' or ', ',']
            testable_words = ['shall', 'must', 'will']
            specific_numbers = bool(re.search(r'\d+', request.text))
            
            vague_score = sum(1 for word in vague_words if word in text) * 0.2
            compound_score = sum(1 for ind in compound_indicators if ind in text) * 0.15
            untestable_score = 0.7 if not any(word in text for word in testable_words) else 0.2
            incomplete_score = 0.6 if not specific_numbers else 0.15
            poorly_structured_score = 0.5 if len(request.text.split()) < 5 else 0.1
            
            return ClassificationResponse(
                classifications={
                    "is_vague": min(vague_score, 0.9),
                    "is_compound": min(compound_score, 0.9),
                    "is_untestable": min(untestable_score, 0.9),
                    "is_incomplete": min(incomplete_score, 0.9),
                    "is_poorly_structured": min(poorly_structured_score, 0.9)
                },
                predictions={
                    "is_vague": vague_score > 0.5,
                    "is_compound": compound_score > 0.5,
                    "is_untestable": untestable_score > 0.5,
                    "is_incomplete": incomplete_score > 0.5,
                    "is_poorly_structured": poorly_structured_score > 0.5
                },
                mode="mock"
            )
        
        # Preprocess text
        indices = preprocess_text(request.text)
        
        # Convert to tensor
        text_tensor = torch.LongTensor([indices])
        
        # Get predictions
        with torch.no_grad():
            outputs = model(text_tensor)
            probabilities = torch.sigmoid(outputs).squeeze().tolist()
        
        # If single value, convert to list
        if isinstance(probabilities, float):
            probabilities = [probabilities]
        
        # Map to category names
        categories = [
            "is_vague",
            "is_compound", 
            "is_untestable",
            "is_incomplete",
            "is_poorly_structured"
        ]
        
        # Ensure we have the right number of probabilities
        while len(probabilities) < len(categories):
            probabilities.append(0.0)
        
        classifications = {cat: float(prob) for cat, prob in zip(categories, probabilities)}
        
        # Threshold at 0.5 for binary predictions
        predictions = {cat: prob > 0.5 for cat, prob in classifications.items()}
        
        return ClassificationResponse(
            classifications=classifications,
            predictions=predictions,
            mode="model"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")


@router.get("/health")
async def health_check():
    """Check if the classifier model is loaded and ready"""
    load_model_and_vocab()
    return {
        "pytorch_available": TORCH_AVAILABLE,
        "model_loaded": model is not None,
        "vocab_loaded": vocab is not None,
        "status": "ready" if (model is not None and vocab is not None) else "mock_mode"
    }
