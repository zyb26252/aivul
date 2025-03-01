import openai
from app.core.config import settings
import json

# 配置 OpenAI 客户端
openai.api_key = settings.BAILIAN_API_KEY  # 通义千问的 API key
openai.api_base = settings.API_BASE_URL
openai.timeout = 30  # 设置超时时间为 30 秒

async def generate_description(prompt: str) -> str:
    """
    使用通义千问 API 生成描述
    
    Args:
        prompt: 提示文本
        
    Returns:
        str: 生成的描述文本
    """
    try:
        print(f"Sending request to Qwen API with prompt: {prompt}")
        response = openai.ChatCompletion.create(
            model="qwen-plus",
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
            max_tokens=150,
            top_p=0.95,
            stream=False,
            request_timeout=30  # 设置请求超时时间为 30 秒
        )
        
        print(f"Raw API Response: {response}")
        print(f"API Response (formatted): {json.dumps(response, ensure_ascii=False, indent=2)}")
        
        if isinstance(response, dict):
            print(f"Response keys: {response.keys()}")
            if 'choices' in response and len(response['choices']) > 0:
                choice = response['choices'][0]
                print(f"First choice: {choice}")
                if 'message' in choice:
                    content = choice['message'].get('content', '').strip()
                    print(f"Extracted content from message: {content}")
                    return content
                elif 'text' in choice:
                    text = choice['text'].strip()
                    print(f"Extracted text: {text}")
                    return text
        
        print(f"Unexpected response format: {type(response)}")
        return "抱歉，生成描述失败。请稍后重试。"
    except Exception as e:
        print(f"Error generating description: {str(e)}")
        print(f"Error type: {type(e)}")
        return "抱歉，生成描述时发生错误。请稍后重试。" 