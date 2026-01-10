"use client";
import React from "react";
import { Divider, Menu, Grid, Avatar, Space, Typography, Tag, Spin } from "antd";
import {
  AppstoreAddOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { AppStyles } from "@/types/styles";
import { useLanchaPassa } from "@/hooks/useLanchaPassa";

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface MenuContentProps {
  styles: AppStyles;
}

export default function MenuContent({ styles }: MenuContentProps) {
  const screens = useBreakpoint();
  const router = useRouter();
  const pathname = usePathname();
  const { data: lanchaPassaData, isLoading: isLoadingLanchaPassa } = useLanchaPassa();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "/a-lancha-passa",
      icon: <AppstoreAddOutlined />,
      label: (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>A lancha passa?</span>
            {isLoadingLanchaPassa ? (
              <Spin size="small" />
            ) : lanchaPassaData?.isPassingNow ? (
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0, fontSize: "10px" }}>
                Agora
              </Tag>
            ) : lanchaPassaData?.nextPassage ? (
              <Tag color="default" style={{ margin: 0, fontSize: "10px" }}>
                <ClockCircleOutlined /> {formatTime(new Date(lanchaPassaData.nextPassage))}
              </Tag>
            ) : null}
          </div>
          {lanchaPassaData?.nextPassage && !lanchaPassaData.isPassingNow && (
            <Text type="secondary" style={{ fontSize: "10px", marginLeft: "24px" }}>
              {formatDate(new Date(lanchaPassaData.nextPassage))}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: "/tide-table",
      icon: <LineChartOutlined />,
      label: "Tábua de Maré Mensal",
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
    </>
  );
}

