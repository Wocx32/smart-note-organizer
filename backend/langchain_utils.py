# backend/langchain_utils.py
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import dotenv

dotenv.load_dotenv('../.env')

class TagsOutput(BaseModel):
    tags: list = Field(description="A list of 3-5 relevant tags for the input text")

def summarize_text(text):

    llm = ChatGroq(
        model="llama-3.3-70b-versatile"
    )

    prompt = PromptTemplate.from_template("Summarize this text: {text}")
    chain = prompt | llm
    return chain.run(text=text)

def generate_tags_from_text(text):
    llm = ChatGroq(
        model="llama-3.3-70b-versatile"
    )

    prompt = PromptTemplate.from_template(
        "Generate a list of 3-5 relevant tags for the following text: {text}\n\n"
        "Output only the JSON object in the format {{\"tags\"=[\"tag1\", \"tag1\"]}}, no additional text."
    )

    output_parser = PydanticOutputParser(pydantic_object=TagsOutput)
    
    chain = prompt | llm | output_parser
    result = chain.invoke({"text": text})
    
    # structured_llm = llm.with_structured_output(TagsOutput)

    # result = structured_llm.invoke({"text": text})
    return result.tags



if __name__ == "__main__":
    text = "AI is transforming the world. It is changing the way we work, live, and interact with each other. AI is being used in various fields such as healthcare, finance, and education. The future of AI is bright and full of possibilities."

    print("Tags:", generate_tags_from_text(text))