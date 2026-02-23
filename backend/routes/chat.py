import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from services.llm_service import solve_math_stream, classify_intent
from services.wiki_service import search_wikipedia

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    mode: str = "Smart Auto"  # Auto, Math Solver, Wikipedia Search
    model: str = "Groq"  # Groq, Gemini, Claude, OpenAI
    history: List[Dict[str, str]] = []

@router.post("/solve")
async def solve(request: ChatRequest):
    # 1. Determine Intent if Smart Auto
    determined_mode = request.mode
    if request.mode == "Smart Auto":
        intent = await classify_intent(request.question, request.model)
        determined_mode = "Wikipedia Search" if intent == "wiki" else "Math Solver"

    # 2. Wikipedia Route
    if determined_mode == "Wikipedia Search":
        def wiki_stream():
            response = search_wikipedia(request.question)
            yield response
            
        return StreamingResponse(wiki_stream(), media_type="text/plain")

    # 3. Math Mode (Streaming LLM)
    else:
        return StreamingResponse(
            solve_math_stream(request.question, request.model, request.history),
            media_type="text/plain"
        )
