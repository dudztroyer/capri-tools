"use client";
import React, { useState } from "react";

import { Avatar, Breadcrumb, Button, Divider, Drawer, Dropdown, Grid, Layout, Menu, Space, theme, Typography } from "antd";

import { AppstoreAddOutlined, ClockCircleOutlined, FolderOpenOutlined, HomeOutlined, LogoutOutlined, MenuOutlined, MoreOutlined, SettingOutlined, UserOutlined, WalletOutlined } from "@ant-design/icons";


const { Sider, Content } = Layout;

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export default function App() {
  const { token } = useToken();
  const screens = useBreakpoint();

  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const shouldDisplayOnMobile = screens.lg || screens.xs;

  const styles = {
    container: {
      margin: "0 auto",
      maxWidth: token.screenXL,
      padding: screens.md ? `0px ${token.paddingLG}px` : `0px ${token.padding}px`
    },
    divider: {
      margin: 0
    },
    header: {
      backgroundColor: token.colorBgContainer,
      borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
      padding: `${token.paddingLG}px 0px`
    },
    headerTitleWrapper: {
      alignContent: "end",
      alignItems: "flex-end",
      justifyContent: "space-between",
      width: "100%"
    },
    hideTabletDisplayMobile: {
      display: shouldDisplayOnMobile ? "block" : "none"
    },
    layout: {
      height: "720px"
    },
    logoWrapper: {
      padding: `${token.paddingLG}px 28px ${token.padding}px 28px`
    },
    navbarContainer: {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      margin: "0 auto",
      padding: `${token.paddingXS}px ${token.padding}px`
    },
    navbarMobile: {
      backgroundColor: token.colorBgContainer,
      borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
      display: screens.sm ? "none" : "block"
    },
    navMenu: {
      backgroundColor: "transparent",
      border: 0,
      flexGrow: 1
    },
    paragraph: {
      color: token.colorTextSecondary
    },
    placeholder: {
      backgroundColor: token.colorBgLayout,
      border: `${token.lineWidth}px dashed ${token.colorBorder}`,
      borderRadius: token.borderRadiusLG,
      height: "100%",
      padding: token.paddingLG,
      textAlign: "center"
    },
    profileAvatar: {
      marginLeft: shouldDisplayOnMobile ? "0" : "4px",
      right: shouldDisplayOnMobile ? "0px" : "8px"
    },
    profileMenu: {
      border: 0
    },
    section: {
      backgroundColor: token.colorBgContainer,
      height: "100%",
      padding: `${token.sizeLG}px 0px`
    },
    sider: {
      borderRight: `${token.lineWidth}px solid ${token.colorSplit}`,
      display: "flex",
      display: screens.sm ? "block" : "none",
      flexDirection: "column"
    },
    siderContent: {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    },
    title: {
      fontSize: screens.lg ? token.fontSizeHeading2 : token.fontSizeHeading3,
      marginBottom: 0
    }
  };

  const items = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "my-library",
      icon: <FolderOpenOutlined />,
      label: "My Library",
      children: [
        {
          key: "projects",
          label: "Projects",
        },
        {
          key: "drafts",
          label: "Drafts",
        },
        {
          key: "templates",
          label: "Templates",
        },
      ],
    },
    {
      key: "history",
      icon: <ClockCircleOutlined />,
      label: "History",
    },
    {
      key: "apps",
      icon: <AppstoreAddOutlined />,
      label: "Apps",
      children: [
        {
          key: "browse",
          label: "Browse",
        },
        {
          key: "your-apps",
          label: "Your Apps",
        },
      ],
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const profileMenuItems = [
    {
      key: "profile",
      label: (
        <Space>
          <Avatar
            style={styles.profileAvatar}
            size="small"
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1661&q=80"
          />
          <Text strong style={styles.hideTabletDisplayMobile}>
            Natalie Wilson
          </Text>
        </Space>
      ),
      children: [
        {
          label: "Profile",
          icon: <UserOutlined />,
          key: "0",
        },
        {
          label: "Settings",
          icon: <SettingOutlined />,
          key: "1",
        },
        {
          label: "Billing",
          icon: <WalletOutlined />,
          key: "2",
        },
        {
          type: "divider",
        },
        {
          label: "Logout",
          icon: <LogoutOutlined />,
          key: "3",
        },
      ],
    },
  ];

  const actions = [
    {
      label: "New project",
      key: "1",
      type: "primary",
    },
    {
      label: "New template",
      key: "2",
      type: "default",
    },
  ];

  const menus = (
    <>
      <Menu
        theme="light"
        mode="inline"
        style={styles.navMenu}
        defaultSelectedKeys={["drafts"]}
        defaultOpenKeys={["my-library"]}
        items={items}
      />
      <Divider style={styles.divider} />
      <Menu
        mode={screens.sm ? "vertical" : "inline"}
        items={profileMenuItems}
        style={styles.profileMenu}
      />
    </>
  );

  return (
    <Layout style={styles.layout}>
      <Sider
        style={styles.sider}
        width={256}
        theme="light"
        trigger={null}
        breakpoint="lg"
      >
        <div style={styles.siderContent}>
          <div style={styles.logoWrapper}>Logo here</div>
          {menus}
        </div>
      </Sider>
      <Layout>
        <div style={styles.navbarMobile}>
          <div style={styles.navbarContainer}>
            Logo
            <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} />
            <Drawer
              title="Menu"
              placement="right"
              onClose={onClose}
              open={open}
              bodyStyle={{ padding: 0 }}
            >
              {menus}
            </Drawer>
          </div>
        </div>

        <div style={styles.header}>
          <div style={styles.container}>
            <Breadcrumb
              items={[
                {
                  title: "Home",
                },
                {
                  title: "My Library",
                },
                {
                  title: "Drafts",
                },
              ]}
            />
            <Space
              size="middle"
              direction="horizontal"
              style={styles.headerTitleWrapper}
            >
              <Space direction="vertical">
                <Title style={styles.title}>Drafts</Title>
              </Space>
              {screens.lg ? (
                <Space>
                  {actions
                    .slice()
                    .reverse()
                    .map((item) => (
                      <Button key={item.key} type={item.type}>
                        {item.label}
                      </Button>
                    ))}
                </Space>
              ) : (
                <Dropdown
                  menu={{ items: actions }}
                  placement="bottomRight"
                  arrow
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              )}
            </Space>
          </div>
        </div>

        <Content>
          <div style={styles.section}>
            <div style={styles.container}>
              <div style={styles.placeholder}>
                <Text>Content</Text>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}