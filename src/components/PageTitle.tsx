"use client";
import React from "react";
import { Typography } from "antd";
import { usePathname } from "next/navigation";
import { getRouteConfig } from "@/config/routes";
import { AppStyles } from "@/types/styles";

const { Title } = Typography;

interface PageTitleProps {
  styles: AppStyles;
}

export default function PageTitle({ styles }: PageTitleProps) {
  const pathname = usePathname();
  const config = getRouteConfig(pathname);

  return (
    <Title style={styles.title}>
      {config.title}
    </Title>
  );
}

