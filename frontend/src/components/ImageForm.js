import React, { useState } from 'react';

const ImageForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [architecture, setArchitecture] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // 提交表单时不再包含路径字段
        const imageData = { name, description, architecture };
        // 发送请求到后端
        // ...
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="镜像名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="镜像描述"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="操作系统架构"
                value={architecture}
                onChange={(e) => setArchitecture(e.target.value)}
                required
            />
            <button type="submit">添加镜像</button>
        </form>
    );
};

export default ImageForm; 