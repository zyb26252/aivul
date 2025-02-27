import docker
from typing import Dict, Optional
from app.models.target import Target
import logging

logger = logging.getLogger(__name__)
client = docker.from_env()

def build_image(target: Target) -> Optional[str]:
    """
    构建Docker镜像
    """
    try:
        # 创建临时Dockerfile
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.dockerfile') as f:
            f.write(target.dockerfile)
            dockerfile_path = f.name
        
        # 构建镜像
        tag = f"target-{target.id}:latest"
        image, logs = client.images.build(
            path=os.path.dirname(dockerfile_path),
            dockerfile=os.path.basename(dockerfile_path),
            tag=tag,
            rm=True
        )
        
        # 清理临时文件
        os.unlink(dockerfile_path)
        
        return tag
    except Exception as e:
        logger.error(f"Error building image: {str(e)}", exc_info=True)
        return None

def create_container(
    image_tag: str,
    name: str,
    ports: Dict[str, str] = None,
    environment: Dict[str, str] = None
) -> Optional[str]:
    """
    创建并启动容器
    """
    try:
        container = client.containers.run(
            image_tag,
            name=name,
            detach=True,
            ports=ports,
            environment=environment
        )
        return container.id
    except Exception as e:
        logger.error(f"Error creating container: {str(e)}", exc_info=True)
        return None

def stop_container(container_id: str) -> bool:
    """
    停止容器
    """
    try:
        container = client.containers.get(container_id)
        container.stop()
        return True
    except Exception as e:
        logger.error(f"Error stopping container: {str(e)}", exc_info=True)
        return False

def remove_container(container_id: str) -> bool:
    """
    删除容器
    """
    try:
        container = client.containers.get(container_id)
        container.remove(force=True)
        return True
    except Exception as e:
        logger.error(f"Error removing container: {str(e)}", exc_info=True)
        return False

def get_container_status(container_id: str) -> Optional[dict]:
    """
    获取容器状态信息
    """
    try:
        container = client.containers.get(container_id)
        return {
            "status": container.status,
            "started_at": container.attrs['State']['StartedAt'],
            "platform": container.attrs['Platform'],
            "image": container.image.tags[0] if container.image.tags else None,
            "ports": container.ports,
            "network_settings": container.attrs['NetworkSettings']['Networks']
        }
    except Exception as e:
        logger.error(f"Error getting container status: {str(e)}", exc_info=True)
        return None

def get_container_logs(container_id: str, tail: int = 100) -> Optional[str]:
    """
    获取容器日志
    """
    try:
        container = client.containers.get(container_id)
        logs = container.logs(tail=tail, timestamps=True).decode('utf-8')
        return logs
    except Exception as e:
        logger.error(f"Error getting container logs: {str(e)}", exc_info=True)
        return None

def restart_container(container_id: str) -> bool:
    """
    重启容器
    """
    try:
        container = client.containers.get(container_id)
        container.restart()
        return True
    except Exception as e:
        logger.error(f"Error restarting container: {str(e)}", exc_info=True)
        return False

def get_container_stats(container_id: str) -> Optional[dict]:
    """
    获取容器资源使用统计
    """
    try:
        container = client.containers.get(container_id)
        stats = container.stats(stream=False)
        return {
            "cpu_usage": stats["cpu_stats"]["cpu_usage"]["total_usage"],
            "memory_usage": stats["memory_stats"]["usage"],
            "memory_limit": stats["memory_stats"]["limit"],
            "network_rx": stats["networks"]["eth0"]["rx_bytes"],
            "network_tx": stats["networks"]["eth0"]["tx_bytes"]
        }
    except Exception as e:
        logger.error(f"Error getting container stats: {str(e)}", exc_info=True)
        return None

def execute_command(container_id: str, cmd: str) -> Optional[tuple]:
    """
    在容器中执行命令
    """
    try:
        container = client.containers.get(container_id)
        exit_code, output = container.exec_run(cmd)
        return (exit_code, output.decode('utf-8'))
    except Exception as e:
        logger.error(f"Error executing command: {str(e)}", exc_info=True)
        return None 