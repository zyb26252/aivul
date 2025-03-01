from fastapi import APIRouter
from . import ai

api_router = APIRouter()

api_router.include_router(ai.router, prefix="/ai", tags=["AI"]) 