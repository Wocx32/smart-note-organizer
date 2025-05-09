# backend/main.py
from fastapi import FastAPI, HTTPException
from langchain_utils import summarize_text, generate_tags_from_text

app = FastAPI()

@app.post("/summarize")
async def summarize(data: dict):
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    summary = summarize_text(text)
    return {"summary": summary}

@app.post("/generate-tags")
async def generate_tags(data: dict):
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    tags = generate_tags_from_text(text)
    return {"tags": tags}