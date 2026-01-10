"use client";
import React from "react";
import { Space } from "antd";
import PageBreadcrumb from "./PageBreadcrumb";
import PageTitle from "./PageTitle";
import { AppStyles } from "@/types/styles";

interface AppHeaderProps {
  styles: AppStyles;
}

export default function AppHeader({ styles }: AppHeaderProps) {
  return (
    <div style={styles.header}>
      <div style={styles.container}>
        <PageBreadcrumb />
        <Space
          size="middle"
          style={styles.headerTitleWrapper}
        >
          <Space orientation="vertical">
            <PageTitle styles={styles} />
          </Space>
        </Space>
      </div>
    </div>
  );
}

