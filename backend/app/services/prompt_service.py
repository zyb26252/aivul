from typing import List, Dict, Any

class PromptService:
    @staticmethod
    def get_description_prompt(image: Dict[str, Any], software_list: List[Dict[str, Any]]) -> str:
        """
        生成环境描述的提示词
        """
        software_info = ", ".join([f"{s['name']} {s['version']}" for s in software_list])
        return f"""你是一个专业的容器化环境描述生成器。请根据以下信息生成简洁、专业的中文描述。描述应该突出环境的主要用途和特点。

环境信息：
- 基础镜像：{image['name']} {image['version']} ({image['architecture']})
- 包含软件：{software_info}

请生成一个简短的中文描述，说明这个环境的主要用途和特点。描述应该专业、准确，并突出环境的核心功能。"""

    @staticmethod
    def get_dockerfile_optimization_prompt(dockerfile: str) -> str:
        """
        生成 Dockerfile 优化的提示词
        """
        return f"""你是一个专业的 Dockerfile 优化专家。请根据以下原则优化 Dockerfile：

优化目标：
1. 减小镜像大小：
   - 使用多阶段构建
   - 清理不必要的文件和缓存
   - 合并相关的 RUN 指令

2. 提高构建速度：
   - 优化层次结构
   - 合理使用缓存
   - 减少不必要的层数

3. 增强安全性：
   - 使用非 root 用户
   - 移除敏感信息
   - 使用安全的基础镜像

4. 改进可维护性：
   - 添加必要的注释
   - 使用环境变量
   - 标准化指令顺序

5. 优化指令：
   - 使用 COPY 替代 ADD
   - 合理设置 WORKDIR
   - 优化 CMD/ENTRYPOINT

以下是原始的 Dockerfile：
{dockerfile}

请直接提供优化后的 Dockerfile 内容，不要添加任何解释性文字或 Markdown 格式。"""

    @staticmethod
    def get_compatibility_check_prompt(base_image: Dict[str, Any], software_list: List[Dict[str, Any]]) -> str:
        """
        生成软件兼容性检查的提示词
        """
        software_info = "\n".join([
            f"- {s['name']} {s['version']} ({s['architecture']})" 
            for s in software_list
        ])
        
        return f"""你是一个专业的软件兼容性分析专家。请根据以下信息分析可能存在的兼容性问题并提供专业的建议。

环境信息：
基础镜像: {base_image['name']} {base_image['version']} ({base_image['architecture']})

软件列表:
{software_info}

请检查以下方面：
1. 软件之间是否存在版本冲突
2. 软件是否与基础镜像兼容
3. 架构是否匹配
4. 是否存在已知的依赖冲突

请提供详细的分析结果，包括：
1. 是否存在兼容性问题
2. 具体的问题描述
3. 改进建议""" 