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
    
    # 收集所有端口
    all_ports = set()
    for software in software_list:
        if software.ports:
            all_ports.update(software.ports)
    
    # 添加端口暴露
    if all_ports:
        dockerfile += "# Expose ports\n"
        for port in sorted(all_ports):
            dockerfile += f"EXPOSE {port}\n"
        dockerfile += "\n"
    
    # 添加启动命令
    if software_list:
        dockerfile += "# Start commands\n"
        start_commands = []
        for software in software_list:
            if software.start_command:
                start_commands.extend(software.start_command)
        
        if start_commands:
            # 使用 bash -c 来运行多个命令
            combined_command = " & ".join(start_commands)
            dockerfile += f'CMD ["bash", "-c", "{combined_command} & wait"]\n'
    
    return dockerfile 