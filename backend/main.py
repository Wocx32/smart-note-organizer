from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_utils import summarize_text, generate_tags_from_text

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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