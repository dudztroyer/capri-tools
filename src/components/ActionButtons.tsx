"use client";
import React from "react";
import { Button, Dropdown, Grid, Space } from "antd";
import { MoreOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

export interface ActionButton {
  label: string;
  key: string;
  type: "primary" | "default";
}

interface ActionButtonsProps {
  actions?: ActionButton[];
}

const defaultActions: ActionButton[] = [
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

export default function ActionButtons({ actions }: ActionButtonsProps) {
  const screens = useBreakpoint();
  const headerActions = actions && actions.length > 0 ? actions : defaultActions;

  if (screens.lg) {
    return (
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
    );
  }

  return (
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
  );
}

