"use client";
import React from "react";
import Image from "next/image";
import { Layout } from "antd";
import MenuContent from "./MenuContent";
import logo from "@/assets/logo.png";
import { AppStyles } from "@/types/styles";

const { Sider } = Layout;

interface SidebarProps {
  styles: AppStyles;
}

export default function Sidebar({ styles }: SidebarProps) {
  return (
    <Sider
      style={styles.sider}
      width={256}
      theme="light"
      trigger={null}
      breakpoint="lg"
    >
      <div style={styles.siderContent}>
        <div style={styles.logoWrapper}>
          <Image
            src={logo}
            alt="Logo"
            width={64}
            height={64}
            style={{ display: "block", margin: "0 auto" }}
          />
        </div>
        <MenuContent styles={styles} />
      </div>
    </Sider>
  );
}

