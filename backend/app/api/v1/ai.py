from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from typing import Optional

router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    description: str

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

@router.post("/generate", response_model=GenerateResponse)
async def generate_description(request: GenerateRequest):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {
                            "role": "system",
                            "content": "你是一个专业的容器化环境描述生成器。请根据提供的基础镜像和软件信息，生成简洁、专业的中文描述。描述应该突出环境的主要用途和特点。"
                        },
                        {
                            "role": "user",
                            "content": request.prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 150
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"Deepseek API error: {response.text}"
                )
                
            result = response.json()
            description = result["choices"][0]["message"]["content"].strip()
            
            return GenerateResponse(description=description)
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Request to Deepseek API timed out"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating description: {str(e)}"
        ) 