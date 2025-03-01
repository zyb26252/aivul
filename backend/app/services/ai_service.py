import openai
from app.core.config import settings

# 配置 OpenAI
openai.api_key = settings.DEEPSEEK_API_KEY
openai.api_base = settings.DEEPSEEK_API_BASE

async def generate_description(prompt: str) -> str:
    """
    使用 DeepSeek API 生成描述
    
    Args:
        prompt: 提示文本
        
    Returns:
        str: 生成的描述文本
    """
    response = openai.ChatCompletion.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": "你是一个专业的容器化环境描述生成器。请根据提供的基础镜像和软件信息，生成简洁、专业的中文描述。描述应该突出环境的主要用途和特点。"
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=150
    )
    
    return response.choices[0].message.content.strip() 