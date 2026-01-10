"use client";
import React from "react";
import Image from "next/image";
import { Layout } from "antd";
import MenuContent from "./MenuContent";
import logo from "@/assets/logo horizontal.png";
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
            width={180}
            height={48}
            style={{ display: "block", margin: "0 auto", objectFit: "contain" }}
          />
        </div>
        <MenuContent styles={styles} />
      </div>
    </Sider>
  );
}

