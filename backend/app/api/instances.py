from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.instance import Instance, InstanceCreate, InstanceUpdate
from app.models.instance import Instance as InstanceModel
from app.models.target import Target as TargetModel
from app.models.user import User
from app.utils import docker
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def build_and_start_instance(db: Session, instance_id: int):
    """
    后台任务：构建并启动实例
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        return
    
    try:
        # 构建镜像
        image_tag = docker.build_image(instance.target)
        if not image_tag:
            instance.status = "failed"
            db.commit()
            return
        
        # 创建并启动容器
        container_id = docker.create_container(
            image_tag,
            f"instance-{instance.id}",
            instance.ports,
            instance.environment
        )
        
        if container_id:
            instance.container_id = container_id
            instance.status = "running"
        else:
            instance.status = "failed"
        
        db.commit()
    except Exception as e:
        logger.error(f"Error in build_and_start_instance: {str(e)}", exc_info=True)
        instance.status = "failed"
        db.commit()

@router.get("/", response_model=List[Instance])
def list_instances(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取实例列表
    """
    instances = db.query(InstanceModel).offset(skip).limit(limit).all()
    return instances

@router.post("/", response_model=Instance)
def create_instance(
    *,
    db: Session = Depends(deps.get_db),
    instance_in: InstanceCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建新实例
    """
    try:
        # 验证靶标是否存在
        target = db.query(TargetModel).filter(TargetModel.id == instance_in.target_id).first()
        if not target:
            raise HTTPException(status_code=404, detail="Target not found")
        
        # 创建实例
        instance = InstanceModel(
            **instance_in.dict(),
            created_by_id=current_user.id,
            status="creating"
        )
        
        db.add(instance)
        db.commit()
        db.refresh(instance)
        
        # 添加后台任务
        background_tasks.add_task(build_and_start_instance, db, instance.id)
        
        return instance
    except Exception as e:
        logger.error(f"Error creating instance: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating instance: {str(e)}"
        )

@router.get("/{instance_id}", response_model=Instance)
def get_instance(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取指定实例信息
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return instance

@router.post("/{instance_id}/stop")
def stop_instance(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    停止实例
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    if instance.container_id:
        if docker.stop_container(instance.container_id):
            instance.status = "stopped"
            db.commit()
            return {"ok": True}
    
    raise HTTPException(status_code=400, detail="Failed to stop instance")

@router.delete("/{instance_id}")
def delete_instance(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    删除实例
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    # 如果容器存在，先删除容器
    if instance.container_id:
        docker.remove_container(instance.container_id)
    
    db.delete(instance)
    db.commit()
    return {"ok": True}

@router.get("/{instance_id}/status")
def get_instance_status(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取实例运行状态
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    if not instance.container_id:
        return {"status": instance.status}
    
    status = docker.get_container_status(instance.container_id)
    if not status:
        return {"status": "unknown"}
    
    return status

@router.get("/{instance_id}/logs")
def get_instance_logs(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    tail: int = 100,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取实例日志
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    if not instance.container_id:
        return {"logs": "No container found"}
    
    logs = docker.get_container_logs(instance.container_id, tail)
    if logs is None:
        raise HTTPException(status_code=400, detail="Failed to get logs")
    
    return {"logs": logs}

@router.post("/{instance_id}/restart")
def restart_instance(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    重启实例
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    if not instance.container_id:
        raise HTTPException(status_code=400, detail="No container to restart")
    
    if docker.restart_container(instance.container_id):
        instance.status = "running"
        db.commit()
        return {"ok": True}
    
    raise HTTPException(status_code=400, detail="Failed to restart instance")

@router.post("/batch/stop")
def batch_stop_instances(
    *,
    db: Session = Depends(deps.get_db),
    instance_ids: List[int],
    current_user: User = Depends(deps.get_current_user),
):
    """
    批量停止实例
    """
    results: Dict[int, bool] = {}
    for instance_id in instance_ids:
        instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
        if instance and instance.container_id:
            success = docker.stop_container(instance.container_id)
            if success:
                instance.status = "stopped"
                db.commit()
            results[instance_id] = success
        else:
            results[instance_id] = False
    
    return {"results": results}

@router.post("/batch/delete")
def batch_delete_instances(
    *,
    db: Session = Depends(deps.get_db),
    instance_ids: List[int],
    current_user: User = Depends(deps.get_current_user),
):
    """
    批量删除实例
    """
    results: Dict[int, bool] = {}
    for instance_id in instance_ids:
        try:
            instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
            if instance:
                if instance.container_id:
                    docker.remove_container(instance.container_id)
                db.delete(instance)
                results[instance_id] = True
            else:
                results[instance_id] = False
        except Exception:
            results[instance_id] = False
    
    db.commit()
    return {"results": results}

@router.get("/{instance_id}/stats")
def get_instance_stats(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取实例资源使用统计
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    if not instance.container_id:
        raise HTTPException(status_code=400, detail="No container found")
    
    stats = docker.get_container_stats(instance.container_id)
    if not stats:
        raise HTTPException(status_code=400, detail="Failed to get stats")
    
    return stats

@router.post("/{instance_id}/exec")
def execute_instance_command(
    *,
    db: Session = Depends(deps.get_db),
    instance_id: int,
    command: str,
    current_user: User = Depends(deps.get_current_user),
):
    """
    在实例中执行命令
    """
    instance = db.query(InstanceModel).filter(InstanceModel.id == instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    
    if not instance.container_id:
        raise HTTPException(status_code=400, detail="No container found")
    
    result = docker.execute_command(instance.container_id, command)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to execute command")
    
    exit_code, output = result
    return {
        "exit_code": exit_code,
        "output": output
    } 