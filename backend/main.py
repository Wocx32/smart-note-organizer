from fastapi import FastAPI, HTTPException
from langchain_utils import build_summary_tags_flashcard

app = FastAPI()

@app.post("/process")
async def process_text(data: dict):
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    result = build_summary_tags_flashcard(text)

    summary = result.summary
    tags = result.tags
    anki_flashcard = result.flashcard.model_dump()
    
    return {
        "summary": summary,
        "tags": tags,
        "anki_flashcard": anki_flashcard
    }