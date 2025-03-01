from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from openai import AsyncOpenAI

router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    description: str

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_BASE = "https://api.deepseek.com/v1"

# 配置 OpenAI 客户端
client = AsyncOpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url=DEEPSEEK_API_BASE
)

@router.post("/generate", response_model=GenerateResponse)
async def generate_description(request: GenerateRequest):
    try:
        response = await client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的容器化环境描述生成器。请根据提供的基础镜像和软件信息，生成简洁、专业的中文描述。描述应该突出环境的主要用途和特点。"
                },
                {
                    "role": "user",
                    "content": request.prompt
                }
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        description = response.choices[0].message.content.strip()
        return GenerateResponse(description=description)
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating description: {str(e)}"
        ) 