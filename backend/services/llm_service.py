import os
from typing import AsyncGenerator, List, Dict
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

def get_llm(model_selection: str):
    if model_selection == "Gemini":
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            google_api_key=os.environ.get("GEMINI_API_KEY")
        )
    elif model_selection == "Claude":
        return ChatAnthropic(
            model="claude-3-haiku-20240307",
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )
    elif model_selection == "OpenAI":
        return ChatOpenAI(
            model="gpt-4o-mini",
            api_key=os.environ.get("OPENAI_API_KEY")
        )
    else:  # Default to Groq
        return ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=os.environ.get("GROQ_API_KEY")
        )

async def solve_math_stream(
    question: str, 
    model_selection: str, 
    history: List[Dict[str, str]]
) -> AsyncGenerator[str, None]:
    
    llm = get_llm(model_selection)

    # Convert frontend history to LangChain messages format
    formatted_history = []
    for msg in history:
        if msg.get("role") == "user":
            formatted_history.append(HumanMessage(content=msg.get("content")))
        elif msg.get("role") == "assistant":
            formatted_history.append(AIMessage(content=msg.get("content")))

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert mathematician and helpful assistant. Format math clearly using LaTeX. Use `$$` for block math and `$` for inline math. Solve problems step-by-step with reasoning."),
        MessagesPlaceholder(variable_name="history"),
        ("user", "{question}")
    ])

    chain = prompt | llm | StrOutputParser()
    
    # We use astream to yield tokens as they arrive
    async for chunk in chain.astream({"question": question, "history": formatted_history}):
        yield chunk

async def classify_intent(question: str, model_selection: str) -> str:
    """Uses a lightweight prompt to determine if the query is best suited for Math/General Logic or Wikipedia."""
    # We'll use the selected model for classification to avoid dealing with multiple keys, 
    # but ideally this might use a cheap fast model like Groq Llama 3 8b.
    llm = get_llm(model_selection)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a routing assistant. Your ONLY job is to output 'math' or 'wiki'. "
                   "Output 'math' if the user is asking to solve a math problem, analyze logic, or write code. "
                   "Output 'wiki' if the user is asking for general facts, history, biographies, or explanations of factual real-world concepts. "
                   "Output nothing else. Always choose 'math' or 'wiki'."),
        ("user", "{question}")
    ])
    
    chain = prompt | llm | StrOutputParser()
    result = await chain.ainvoke({"question": question})
    
    return "wiki" if "wiki" in result.lower() else "math"
