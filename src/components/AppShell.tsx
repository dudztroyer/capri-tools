"use client";
import React from "react";
import { Layout, theme, Grid, Typography } from "antd";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import AppHeader from "./AppHeader";

const { Content } = Layout;
const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text } = Typography;

interface AppShellProps {
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    key: string;
    type: "primary" | "default";
  }>;
}

export default function AppShell({ children, actions }: AppShellProps) {
  const { token } = useToken();
  const screens = useBreakpoint();

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
      minHeight: "100vh"
    },
    logoWrapper: {
      padding: `${token.paddingLG}px 28px ${token.padding}px 28px`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
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
      display: screens.sm ? "block" : "none",
    },
    siderContent: {
      display: "flex",
      flexDirection: "column" as const,
      height: "100%"
    },
    title: {
      fontSize: screens.lg ? token.fontSizeHeading2 : token.fontSizeHeading3,
      marginBottom: 0
    }
  };

  return (
    <Layout style={styles.layout}>
      <Sidebar styles={styles} />
      <Layout>
        <MobileNavbar styles={styles} />
        <AppHeader styles={styles} actions={actions} />
        <Content>
          <div style={styles.section}>
            <div style={styles.container}>
              {children}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

