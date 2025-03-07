import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Space, message, Modal } from 'antd';
import type { Scene } from '@/types/scene';
import { getSceneList, deleteScene, copyScene } from '@/services/scene';
import styles from './index.module.less';

const { Search } = Input;
const { confirm } = Modal;

const SceneList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<Scene[]>([]);

  const fetchScenes = async () => {
    try {
      setLoading(true);
      const res = await getSceneList({
        keyword,
        page: current,
        pageSize,
      });
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取场景列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
  }, [current, pageSize, keyword]);

  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: '确认删除',
      content: '确定要删除这个场景吗？',
      async onOk() {
        try {
          await deleteScene(id);
          message.success('删除成功');
          fetchScenes();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleCopy = async (id: string) => {
    try {
      await copyScene(id);
      message.success('复制成功');
      fetchScenes();
    } catch (error) {
      message.error('复制失败');
    }
  };

  const columns = [
    {
      title: '场景名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '场景描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '节点数量',
      dataIndex: 'nodeCount',
      key: 'nodeCount',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Scene) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleCopy(record.id)}>
            复制
          </Button>
          <Button type="link">编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Search
          placeholder="搜索场景名称或描述"
          allowClear
          enterButton
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          current,
          pageSize,
          total,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size || 10);
          },
        }}
      />
    </div>
  );
};

export default SceneList; 