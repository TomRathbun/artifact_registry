# Requirements Quality Classifier Integration

## Overview
The Requirements Quality Classifier uses a trained LSTM (Long Short-Term Memory) neural network model to automatically analyze requirement text and identify potential quality issues.

## Features
The classifier evaluates requirements across 5 quality dimensions:

1. **Vague** - Detects ambiguous or unclear language
2. **Compound** - Identifies requirements that combine multiple requirements into one
3. **Untestable** - Flags requirements that cannot be verified or tested objectively
4. **Incomplete** - Detects missing critical information or context
5. **Poorly Structured** - Identifies requirements that don't follow standard format

## How to Use

### In the Requirements Presentation View:
1. Navigate to any requirement in presentation mode
2. Look for the "Requirement Quality Analysis" section
3. Click "Show Analysis" to run the classifier
4. Review the results:
   - Overall quality indicator (✓ Good Quality or ⚠ Quality Issues Detected)
   - Individual scores for each quality dimension (0-100%)
   - Visual progress bars color-coded by severity:
     - Green (0-30%): Low risk
     - Yellow (30-60%): Medium risk
     - Red (60-100%): High risk
5. Click "Re-analyze" to run the analysis again if the text has changed

## Technical Details

### Backend API
- **Endpoint**: `/api/v1/classifier/classify`
- **Method**: POST
- **Request Body**: `{ "text": "requirement text" }`
- **Response**: 
  ```json
  {
    "classifications": {
      "is_vague": 0.15,
      "is_compound": 0.10,
      "is_untestable": 0.08,
      "is_incomplete": 0.12,
      "is_poorly_structured": 0.09
    },
    "predictions": {
      "is_vague": false,
      "is_compound": false,
      "is_untestable": false,
      "is_incomplete": false,
      "is_poorly_structured": false
    }
  }
  ```

### Model Integration
The classifier attempts to load the LSTM model from the `requirements_classifier` project. If the model file is not found, it will operate in "mock mode" and return sample data for demonstration purposes.

**Model Location**: The system looks for the model in these locations:
- `C:\Users\USER\requirements_classifier\lstm_model.pth`
- `C:\Users\USER\requirements_classifier\model\lstm_model.pth`
- `..\requirements_classifier\lstm_model.pth`

### Model Architecture
- **Type**: LSTM (Long Short-Term Memory) Neural Network
- **Input**: Tokenized requirement text (max 100 tokens)
- **Output**: 5 probability scores (one for each quality dimension)
- **Threshold**: 0.5 (probabilities above 0.5 are flagged as issues)

## Benefits
- **Automated Quality Checks**: Instantly identify potential issues in requirements
- **Consistency**: Apply the same quality standards across all requirements
- **Early Detection**: Catch quality issues before they impact downstream development
- **Learning Tool**: Understand common requirement quality pitfalls

## Future Enhancements
- Batch analysis of multiple requirements
- Quality trend tracking over time
- Suggestions for improving flagged requirements
- Custom threshold configuration
- Export quality reports
