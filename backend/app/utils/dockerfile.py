from app.models.image import Image
from app.models.software import Software
from typing import List

def generate_dockerfile(base_image: Image, software_list: List[Software]) -> str:
    """
    生成 Dockerfile 内容
    """
    dockerfile = f"FROM {base_image.registry_path}\n\n"
    
    # 添加维护者信息
    dockerfile += "LABEL maintainer='Target Builder System'\n\n"
    
    # 添加软件安装命令
    if software_list:
        dockerfile += "# Install software\n"
        for software in software_list:
            dockerfile += f"# Install {software.name} {software.version}\n"
            dockerfile += f"RUN {software.install_command}\n\n"
    
    return dockerfile 