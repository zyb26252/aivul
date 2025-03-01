// 添加镜像的 API
app.post('/api/images', (req, res) => {
    const { name, description, architecture } = req.body; // 删除路径字段

    // 进行镜像的创建逻辑
    // ...
    res.status(201).send({ message: '镜像创建成功' });
});

// 其他 API 代码... 