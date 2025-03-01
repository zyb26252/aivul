from pydantic import BaseModel
from typing import List

class Activity(BaseModel):
    id: int
    type: str
    name: str
    createdAt: str

    class Config:
        allow_population_by_field_name = True

class ResourceUsage(BaseModel):
    cpuUsage: float
    memoryUsage: float
    diskUsage: float

    class Config:
        allow_population_by_field_name = True

class DashboardStats(BaseModel):
    totalImages: int
    totalInstances: int
    totalTargets: int
    totalSoftware: int
    recentActivities: List[Activity]
    resourceUsage: ResourceUsage

    class Config:
        allow_population_by_field_name = True 