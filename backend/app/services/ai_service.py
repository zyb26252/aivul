import openai
from app.core.config import settings
import json
from typing import List, Dict, Any

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
            model="qwen-turbo",
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

async def check_software_compatibility(base_image: Dict[str, Any], software_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    使用通义千问 API 检查软件兼容性
    
    Args:
        base_image: 基础镜像信息
        software_list: 软件列表信息
        
    Returns:
        Dict[str, Any]: 包含兼容性检查结果和建议
    """
    try:
        # 构建提示信息
        software_info = "\n".join([
            f"- {s['name']} {s['version']} ({s['architecture']})" 
            for s in software_list
        ])
        
        prompt = f"""请分析以下软件组合的兼容性:

基础镜像: {base_image['name']} {base_image['version']} ({base_image['architecture']})

软件列表:
{software_info}

请检查:
1. 软件之间是否存在版本冲突
2. 软件是否与基础镜像兼容
3. 架构是否匹配
4. 是否存在已知的依赖冲突

请提供详细的分析结果，包括:
1. 是否存在兼容性问题
2. 具体的问题描述
3. 改进建议"""

        response = openai.ChatCompletion.create(
            model="qwen-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的软件兼容性分析专家。请根据提供的基础镜像和软件信息，分析可能存在的兼容性问题并提供专业的建议。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=500,
            top_p=0.95,
            stream=False,
            request_timeout=30
        )
        
        # 解析响应
        if response and response.choices:
            analysis = response.choices[0].message.content
            
            # 返回结构化的结果
            return {
                "has_compatibility_issues": "不兼容" in analysis or "冲突" in analysis,
                "analysis": analysis,
                "raw_response": response
            }
        else:
            return {
                "has_compatibility_issues": True,
                "analysis": "无法获取兼容性分析结果",
                "error": "API 响应为空"
            }
            
    except Exception as e:
        print(f"Error in compatibility check: {str(e)}")
        return {
            "has_compatibility_issues": True,
            "analysis": f"兼容性检查过程中发生错误: {str(e)}",
            "error": str(e)
        } 