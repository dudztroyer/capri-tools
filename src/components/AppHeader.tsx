"use client";
import React from "react";
import { Space } from "antd";
import PageBreadcrumb from "./PageBreadcrumb";
import PageTitle from "./PageTitle";
import ActionButtons, { ActionButton } from "./ActionButtons";

interface AppHeaderProps {
  styles: any;
  actions?: ActionButton[];
}

export default function AppHeader({ styles, actions }: AppHeaderProps) {
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
          <ActionButtons actions={actions} />
        </Space>
      </div>
    </div>
  );
}

