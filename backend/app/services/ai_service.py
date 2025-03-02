import openai
from app.core.config import settings
import json
from typing import List, Dict, Any
from .prompt_service import PromptService

# 配置 OpenAI 客户端
openai.api_key = settings.BAILIAN_API_KEY  # 通义千问的 API key
openai.api_base = settings.API_BASE_URL
openai.timeout = 30  # 设置超时时间为 30 秒

async def _call_ai_api(prompt: str, max_tokens: int = 500) -> str:
    """
    调用 AI API 的通用方法
    """
    try:
        response = openai.ChatCompletion.create(
            model="qwen-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的容器化环境专家。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=max_tokens,
            top_p=0.95,
            stream=False,
            request_timeout=30
        )
        
        if isinstance(response, dict) and 'choices' in response:
            choice = response['choices'][0]
            if 'message' in choice:
                return choice['message'].get('content', '').strip()
            elif 'text' in choice:
                return choice['text'].strip()
        
        return "抱歉，生成内容失败。请稍后重试。"
    except Exception as e:
        print(f"Error calling AI API: {str(e)}")
        return "抱歉，调用 AI 服务时发生错误。请稍后重试。"

async def generate_description(image: Dict[str, Any], software_list: List[Dict[str, Any]]) -> str:
    """
    生成环境描述
    """
    prompt = PromptService.get_description_prompt(image, software_list)
    return await _call_ai_api(prompt, max_tokens=150)

async def optimize_dockerfile(dockerfile: str) -> str:
    """
    优化 Dockerfile
    """
    prompt = PromptService.get_dockerfile_optimization_prompt(dockerfile)
    response = await _call_ai_api(prompt, max_tokens=1000)
    
    # 移除可能存在的 Markdown 代码块标记
    cleaned_response = response.replace('```dockerfile\n', '').replace('```\n', '').replace('```', '').strip()
    return cleaned_response

async def check_software_compatibility(base_image: Dict[str, Any], software_list: List[Dict[str, Any]]) -> str:
    """
    检查软件兼容性
    """
    prompt = PromptService.get_compatibility_check_prompt(base_image, software_list)
    return await _call_ai_api(prompt, max_tokens=500) 