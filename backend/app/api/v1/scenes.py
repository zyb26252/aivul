from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.scene import Scene
from app.models.user import User
from app.schemas.scene import Scene as SceneSchema, SceneCreate, SceneUpdate, SceneList

router = APIRouter()

@router.get("/", response_model=SceneList)
def get_scenes(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    keyword: str = None,
) -> Any:
    """
    获取场景列表
    """
    scenes, total = Scene.get_multi(
        db,
        skip=skip,
        limit=limit,
        keyword=keyword,
        user_id=current_user.id
    )
    return {"items": scenes, "total": total}

@router.post("/", response_model=SceneSchema)
def create_scene(
    *,
    db: Session = Depends(deps.get_db),
    scene_in: SceneCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    创建新场景
    """
    scene = Scene.create(
        db,
        name=scene_in.name,
        description=scene_in.description,
        user_id=current_user.id
    )
    return scene

@router.get("/{id}", response_model=SceneSchema)
def get_scene(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    获取场景详情
    """
    scene = Scene.get(db, id=id)
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    return scene

@router.put("/{id}", response_model=SceneSchema)
def update_scene(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    scene_in: SceneUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    更新场景
    """
    scene = Scene.get(db, id=id)
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    if scene.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    scene = Scene.update(
        db,
        db_obj=scene,
        name=scene_in.name,
        description=scene_in.description
    )
    return scene

@router.delete("/{id}")
def delete_scene(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    删除场景
    """
    scene = Scene.get(db, id=id)
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    if scene.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    Scene.remove(db, id=id)
    return {"msg": "Scene deleted successfully"}

@router.post("/{id}/copy", response_model=SceneSchema)
def copy_scene(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    复制场景
    """
    scene = Scene.copy(db, id=id, user_id=current_user.id)
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    return scene 