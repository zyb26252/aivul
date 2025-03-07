import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import SceneList from '../SceneList';
import styles from './index.module.less';

const { Sider, Content } = Layout;

const SceneManagement: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('sceneList');

  const menuItems = [
    {
      key: 'sceneList',
      icon: <AppstoreOutlined />,
      label: '场景列表',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'sceneList':
        return <SceneList />;
      default:
        return null;
    }
  };

  return (
    <Layout className={styles.layout}>
      <Sider width={200} className={styles.sider}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Content className={styles.content}>{renderContent()}</Content>
    </Layout>
  );
};

export default SceneManagement; 