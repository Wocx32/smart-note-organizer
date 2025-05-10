from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List
import dotenv

dotenv.load_dotenv('../.env')


class FlashcardOutput(BaseModel):
    front: str = Field(description="The front of the flashcard (question or key concept)")
    back: str = Field(description="The back of the flashcard (answer or explanation)")


class CombinedOutput(BaseModel):
    summary: str = Field(description="A summary of the input text, limited to 2-3 sentences")
    tags: List[str] = Field(description="A list of 3-5 relevant tags for the input text")
    flashcards: List[FlashcardOutput] = Field(description="An list of Anki flashcards with a front and back, based on the input text")


def build_summary_tags_flashcard(text):
    llm = ChatGroq(model="llama-3.3-70b-versatile")

    prompt = PromptTemplate.from_template(
        "Generate a summary (2-3 sentences), a list of 3-5 tags, and a list of as many Anki flashcards (front and back) you see fit based on the following text: {text}. "
        "Format the response as a JSON object with keys 'summary', 'tags', and 'flashcards' (which is a list that contains multiple objects with 'front' and 'back'). "
        "Example structure: {{\"summary\": \"...\", \"tags\": [\"...\", \"...\"], \"flashcards\": [{{\"front\": \"...\", \"back\": \"...\"}}}}, {{\"front\": \"...\", \"back\": \"...\"}}}}]. "
        "Please ensure the output is strictly in the specified JSON format and nothing else."
    )

    output_parser = PydanticOutputParser(pydantic_object=CombinedOutput)
    chain = prompt | llm | output_parser

    result = chain.invoke({"text": text})
    return result


if __name__ == "__main__":
    text = "In a major development, researchers at the Global Institute of AI have announced a breakthrough in real-time language translation technology. The new system, called \"LinguaFlow,\" uses advanced neural networks to translate spoken and written language with near-perfect accuracy and minimal delay.\n\nUnlike previous translation tools, which often struggled with context and idiomatic expressions, LinguaFlow can understand and translate complex conversations in real time. The system has already been tested in international business meetings and is being considered for use in diplomatic settings.\n\nThe team behind LinguaFlow claims that the technology could revolutionize global communication, making language barriers nearly obsolete. It is expected to be released to the public in the next 12 months, with a mobile app and integrated features for major communication platforms."

    result = build_summary_tags_flashcard(text)
    print("Summary:", result.summary)
    print("Tags:", result.tags)
    print("Flashcards:", result.flashcards)