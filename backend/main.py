from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_utils import build_summary_tags_flashcard

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def process_text(data: dict):
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")
    
    result = build_summary_tags_flashcard(text)

    return result

