from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.api import deps
from app.schemas.scene import Scene, SceneCreate, SceneUpdate, SceneList
from app.models.scene import Scene as SceneModel
from app.models.user import User
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=SceneList)
def list_scenes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取场景列表
    - search: 搜索关键词(名称或描述)
    """
    query = db.query(SceneModel)
    
    # 添加搜索条件
    if search:
        query = query.filter(
            or_(
                SceneModel.name.ilike(f"%{search}%"),
                SceneModel.description.ilike(f"%{search}%")
            )
        )
    
    # 确保加载关联的用户数据
    query = query.options(joinedload(SceneModel.created_by))
    
    total = query.count()
    scenes = query.order_by(SceneModel.created_at.desc()).offset(skip).limit(limit).all()
    
    # 确保每个场景都有 created_by_id
    for scene in scenes:
        if scene.created_by_id is None and current_user:
            scene.created_by_id = current_user.id
            db.add(scene)
    
    if db.dirty:
        db.commit()
    
    return {"items": scenes, "total": total}

@router.post("/", response_model=Scene)
def create_scene(
    *,
    db: Session = Depends(deps.get_db),
    scene_in: SceneCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建新场景
    """
    scene = SceneModel(
        name=scene_in.name,
        description=scene_in.description,
        node_count=0,
        topology=scene_in.topology or {"nodes": [], "edges": [], "groups": []},
        created_by_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(scene)
    db.commit()
    db.refresh(scene)
    return scene

@router.get("/{scene_id}", response_model=Scene)
def get_scene(
    *,
    db: Session = Depends(deps.get_db),
    scene_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取指定场景信息
    """
    scene = db.query(SceneModel).filter(SceneModel.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="场景不存在")
    return scene

@router.put("/{scene_id}", response_model=Scene)
def update_scene(
    *,
    db: Session = Depends(deps.get_db),
    scene_id: int,
    scene_in: SceneUpdate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    更新场景信息
    """
    scene = db.query(SceneModel).filter(SceneModel.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="场景不存在")
    
    update_data = scene_in.dict(exclude_unset=True)
    
    # 如果更新了拓扑数据，更新节点数量
    if "topology" in update_data:
        topology = update_data["topology"] or {"nodes": [], "edges": [], "groups": []}
        update_data["node_count"] = len(topology.get("nodes", []))
    
    for field, value in update_data.items():
        setattr(scene, field, value)
    
    db.add(scene)
    db.commit()
    db.refresh(scene)
    return scene

@router.delete("/{scene_id}")
def delete_scene(
    *,
    db: Session = Depends(deps.get_db),
    scene_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    删除场景
    """
    scene = db.query(SceneModel).filter(SceneModel.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="场景不存在")
    
    db.delete(scene)
    db.commit()
    return {"ok": True}

@router.post("/{scene_id}/copy", response_model=Scene)
def copy_scene(
    *,
    db: Session = Depends(deps.get_db),
    scene_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    复制场景
    """
    scene = db.query(SceneModel).filter(SceneModel.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="场景不存在")
    
    new_scene = SceneModel(
        name=f"{scene.name} (复制)",
        description=scene.description,
        node_count=scene.node_count,
        topology=scene.topology,
        created_by_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_scene)
    db.commit()
    db.refresh(new_scene)
    return new_scene 