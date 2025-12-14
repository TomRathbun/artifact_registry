from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Union
from deep_translator import GoogleTranslator

router = APIRouter()

class TranslationRequest(BaseModel):
    text: Union[str, List[str]]
    source: str = "auto"
    target: str = "ar"

@router.post("/translate")
def translate_text(request: TranslationRequest):
    try:
        translator = GoogleTranslator(source=request.source, target=request.target)
        if isinstance(request.text, list):
            if not request.text:
                return {"translated_text": []}
            # deep-translator's update allows translate_batch
            translated = translator.translate_batch(request.text)
            return {"translated_text": translated}
        else:
            if not request.text:
                return {"translated_text": ""}
            translated = translator.translate(request.text)
            return {"translated_text": translated}
    except Exception as e:
        print(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
