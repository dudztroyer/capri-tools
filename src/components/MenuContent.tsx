"use client";
import React from "react";
import { Divider, Menu } from "antd";
import { Grid } from "antd";
import {
  AppstoreAddOutlined,
  ClockCircleOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, Space, Typography } from "antd";

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface MenuContentProps {
  styles: any;
}

export default function MenuContent({ styles }: MenuContentProps) {
  const screens = useBreakpoint();
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "/my-library",
      icon: <FolderOpenOutlined />,
      label: "My Library",
      children: [
        {
          key: "/my-library/projects",
          label: "Projects",
        },
        {
          key: "/my-library/drafts",
          label: "Drafts",
        },
        {
          key: "/my-library/templates",
          label: "Templates",
        },
      ],
    },
    {
      key: "/history",
      icon: <ClockCircleOutlined />,
      label: "History",
    },
    {
      key: "/apps",
      icon: <AppstoreAddOutlined />,
      label: "Apps",
      children: [
        {
          key: "/apps/browse",
          label: "Browse",
        },
        {
          key: "/apps/your-apps",
          label: "Your Apps",
        },
      ],
    },
    {
      key: "/settings",
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

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith("/")) {
      router.push(key);
    }
  };

  const getSelectedKeys = () => {
    if (pathname === "/") return ["/"];
    if (pathname.startsWith("/my-library")) {
      return [pathname];
    }
    if (pathname.startsWith("/apps")) {
      return [pathname];
    }
    return [pathname];
  };

  const getOpenKeys = () => {
    const keys: string[] = [];
    if (pathname.startsWith("/my-library")) {
      keys.push("/my-library");
    }
    if (pathname.startsWith("/apps")) {
      keys.push("/apps");
    }
    return keys;
  };

  return (
    <>
      <Menu
        theme="light"
        mode="inline"
        style={styles.navMenu}
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={items}
        onClick={handleMenuClick}
      />
      <Divider style={styles.divider} />
      <Menu
        mode={screens.sm ? "vertical" : "inline"}
        items={profileMenuItems}
        style={styles.profileMenu}
      />
    </>
  );
}

