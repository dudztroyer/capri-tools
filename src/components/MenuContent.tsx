"use client";
import React from "react";
import { Divider, Menu, Grid, Avatar, Space, Typography } from "antd";
import {
  AppstoreAddOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { AppStyles } from "@/types/styles";

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface MenuContentProps {
  styles: AppStyles;
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
      key: "/a-lancha-passa",
      icon: <AppstoreAddOutlined />,
      label: "A lancha passa?",
    },
    {
      key: "/tide-table",
      icon: <LineChartOutlined />,
      label: "Tábua de Maré Mensal",
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
    return [pathname];
  };

  const getOpenKeys = () => {
    return [];
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

