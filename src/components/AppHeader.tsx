"use client";
import React from "react";
import { Breadcrumb, Button, Dropdown, Grid, Space, Typography } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";

const { useBreakpoint } = Grid;
const { Title } = Typography;

interface AppHeaderProps {
  styles: any;
  actions?: Array<{
    label: string;
    key: string;
    type: "primary" | "default";
  }>;
}

export default function AppHeader({ styles, actions = [] }: AppHeaderProps) {
  const screens = useBreakpoint();
  const pathname = usePathname();

  const getBreadcrumbItems = () => {
    const paths = pathname.split("/").filter(Boolean);
    const items = [{ title: "Home" }];
    
    if (paths.length > 0) {
      if (paths[0] === "my-library") {
        items.push({ title: "My Library" });
        if (paths[1]) {
          const pageName = paths[1].charAt(0).toUpperCase() + paths[1].slice(1);
          items.push({ title: pageName });
        }
      } else if (paths[0] === "apps") {
        items.push({ title: "Apps" });
        if (paths[1]) {
          const pageName = paths[1].replace("-", " ");
          const formattedName = pageName
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          items.push({ title: formattedName });
        }
      } else {
        const pageName = paths[0].charAt(0).toUpperCase() + paths[0].slice(1);
        items.push({ title: pageName });
      }
    }
    
    return items;
  };

  const getPageTitle = () => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length === 0) return "Home";
    if (paths.length === 1) {
      return paths[0].charAt(0).toUpperCase() + paths[0].slice(1);
    }
    const pageName = paths[paths.length - 1];
    return pageName.charAt(0).toUpperCase() + pageName.slice(1).replace("-", " ");
  };

  const defaultActions = [
    {
      label: "New project",
      key: "1",
      type: "primary" as const,
    },
    {
      label: "New template",
      key: "2",
      type: "default" as const,
    },
  ];

  const headerActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div style={styles.header}>
      <div style={styles.container}>
        <Breadcrumb items={getBreadcrumbItems()} />
        <Space
          size="middle"
          style={styles.headerTitleWrapper}
        >
          <Space orientation="vertical">
            <Title style={styles.title}>{getPageTitle()}</Title>
          </Space>
          {screens.lg ? (
            <Space>
              {headerActions
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
              menu={{ 
                items: headerActions.map(action => ({
                  key: action.key,
                  label: action.label,
                }))
              }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </Space>
      </div>
    </div>
  );
}

