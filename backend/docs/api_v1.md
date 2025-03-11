# AI VUL API 文档

## 基本信息

- 基础URL: `http://your-domain/api/v1`
- 所有请求都需要在 header 中包含 `Authorization: Bearer {token}`（除了登录和注册接口）
- 响应格式统一为 JSON

## 认证相关 API

### 用户注册

```http
POST /auth/register
Content-Type: application/json

{
    "username": "string",
    "email": "user@example.com",
    "password": "string"
}
```

响应:
```json
{
    "id": "integer",
    "username": "string",
    "email": "string",
    "is_active": true
}
```

### 用户登录

```http
POST /auth/login
Content-Type: application/json

{
    "username": "string",
    "password": "string"
}
```

响应:
```json
{
    "access_token": "string",
    "token_type": "bearer"
}
```

## 镜像管理 API

### 获取镜像列表

```http
GET /images
```

响应:
```json
{
    "total": "integer",
    "items": [
        {
            "id": "integer",
            "name": "string",
            "description": "string",
            "registry_path": "string",
            "architecture": "string",
            "version": "string",
            "created_at": "datetime"
        }
    ]
}
```

### 创建镜像

```http
POST /images
Content-Type: application/json

{
    "name": "string",
    "description": "string",
    "registry_path": "string",
    "architecture": "string",
    "version": "string"
}
```

## 软件管理 API

### 获取软件列表

```http
GET /software
```

响应:
```json
{
    "total": "integer",
    "items": [
        {
            "id": "integer",
            "name": "string",
            "version": "string",
            "description": "string",
            "install_command": "string",
            "start_command": "string",
            "ports": ["integer"],
            "created_at": "datetime"
        }
    ]
}
```

### 创建软件

```http
POST /software
Content-Type: application/json

{
    "name": "string",
    "version": "string",
    "description": "string",
    "install_command": "string",
    "start_command": "string",
    "ports": ["integer"]
}
```

## 靶标管理 API

### 获取靶标列表

```http
GET /targets
```

响应:
```json
{
    "total": "integer",
    "items": [
        {
            "id": "integer",
            "name": "string",
            "description": "string",
            "base_image_id": "integer",
            "software_ids": ["integer"],
            "created_at": "datetime"
        }
    ]
}
```

### 创建靶标

```http
POST /targets
Content-Type: application/json

{
    "name": "string",
    "description": "string",
    "base_image_id": "integer",
    "software_ids": ["integer"]
}
```

## 场景管理 API

### 获取场景列表

```http
GET /scenes
```

响应:
```json
{
    "total": "integer",
    "items": [
        {
            "id": "integer",
            "name": "string",
            "description": "string",
            "topology": "object",
            "created_at": "datetime"
        }
    ]
}
```

### 创建场景

```http
POST /scenes
Content-Type: application/json

{
    "name": "string",
    "description": "string",
    "topology": {
        "nodes": ["object"],
        "edges": ["object"]
    }
}
```

### 更新场景拓扑

```http
PUT /scenes/{scene_id}/topology
Content-Type: application/json

{
    "topology": {
        "nodes": ["object"],
        "edges": ["object"]
    }
}
```

## 实例管理 API

### 获取实例列表

```http
GET /instances
```

响应:
```json
{
    "total": "integer",
    "items": [
        {
            "id": "integer",
            "name": "string",
            "scene_id": "integer",
            "status": "string",
            "created_at": "datetime",
            "containers": ["object"]
        }
    ]
}
```

### 创建实例

```http
POST /instances
Content-Type: application/json

{
    "name": "string",
    "scene_id": "integer"
}
```

### 操作实例

```http
POST /instances/{instance_id}/action
Content-Type: application/json

{
    "action": "string" // start, stop, restart, delete
}
```

## AI 接口

### 生成场景

```http
POST /ai/generate
Content-Type: application/json

{
    "prompt": "string",
    "parameters": {
        "complexity": "string",
        "target_type": "string"
    }
}
```

响应:
```json
{
    "scene": {
        "name": "string",
        "description": "string",
        "topology": "object"
    }
}
```

## 错误响应

所有接口在发生错误时都会返回统一格式的错误信息：

```json
{
    "detail": {
        "msg": "错误信息",
        "type": "错误类型",
        "code": "错误代码"
    }
}
```

常见错误代码：
- 400: 请求参数错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误 