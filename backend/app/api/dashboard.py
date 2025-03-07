from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import psutil

from app.api.deps import get_db
from app.models.image import Image
from app.models.instance import Instance
from app.models.target import Target
from app.models.software import Software
from app.models.scene import Scene
from app.schemas.dashboard import DashboardStats, Activity, ResourceUsage

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 获取各个模型的总数
    total_images = db.query(Image).count()
    total_instances = db.query(Instance).count()
    total_targets = db.query(Target).count()
    total_software = db.query(Software).count()

    # 获取最近的活动（这里示例从各个表获取最新的记录）
    recent_activities: List[Activity] = []
    
    # 获取最新的镜像
    recent_images = db.query(Image).order_by(Image.created_at.desc()).limit(3).all()
    for image in recent_images:
        recent_activities.append(Activity(
            id=image.id,
            type="新增镜像",
            name=image.name,
            createdAt=image.created_at.isoformat()
        ))

    # 获取最新的实例
    recent_instances = db.query(Instance).order_by(Instance.created_at.desc()).limit(3).all()
    for instance in recent_instances:
        recent_activities.append(Activity(
            id=instance.id,
            type="新增实例",
            name=instance.name,
            createdAt=instance.created_at.isoformat()
        ))

    # 获取最新的软件
    recent_software = db.query(Software).order_by(Software.created_at.desc()).limit(3).all()
    for software in recent_software:
        recent_activities.append(Activity(
            id=software.id,
            type="新增软件",
            name=software.name,
            createdAt=software.created_at.isoformat()
        ))

    # 获取最新的靶标
    recent_targets = db.query(Target).order_by(Target.created_at.desc()).limit(3).all()
    for target in recent_targets:
        recent_activities.append(Activity(
            id=target.id,
            type="新增靶标",
            name=target.name,
            createdAt=target.created_at.isoformat()
        ))

    # 获取最新的场景
    recent_scenes = db.query(Scene).order_by(Scene.created_at.desc()).limit(3).all()
    for scene in recent_scenes:
        recent_activities.append(Activity(
            id=scene.id,
            type="新增场景",
            name=scene.name,
            createdAt=scene.created_at.isoformat()
        ))

    # 获取系统资源使用情况
    # CPU使用率需要一个短暂的时间间隔来计算
    cpu_usage = psutil.cpu_percent(interval=1)
    
    # 获取内存使用情况
    memory = psutil.virtual_memory()
    memory_usage = memory.percent
    
    # 获取根目录的磁盘使用情况
    disk = psutil.disk_usage('/')
    disk_usage = disk.percent
    
    resource_usage = ResourceUsage(
        cpuUsage=round(cpu_usage, 1),
        memoryUsage=round(memory_usage, 1),
        diskUsage=round(disk_usage, 1)
    )

    return DashboardStats(
        totalImages=total_images,
        totalInstances=total_instances,
        totalTargets=total_targets,
        totalSoftware=total_software,
        recentActivities=sorted(recent_activities, key=lambda x: x.createdAt, reverse=True)[:5],
        resourceUsage=resource_usage
    ) 