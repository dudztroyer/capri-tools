"use client";
import React from "react";
import { Typography, Grid } from "antd";
import { usePathname } from "next/navigation";

const { Title } = Typography;
const { useBreakpoint } = Grid;

interface PageTitleProps {
  styles: any;
}

export default function PageTitle({ styles }: PageTitleProps) {
  const screens = useBreakpoint();
  const pathname = usePathname();

  const getPageTitle = () => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length === 0) return "Home";
    if (paths.length === 1) {
      return paths[0].charAt(0).toUpperCase() + paths[0].slice(1);
    }
    const pageName = paths[paths.length - 1];
    return pageName.charAt(0).toUpperCase() + pageName.slice(1).replace("-", " ");
  };

  return (
    <Title style={styles.title}>
      {getPageTitle()}
    </Title>
  );
}

