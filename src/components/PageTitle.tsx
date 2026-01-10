"use client";
import React from "react";
import { Typography } from "antd";
import { usePathname } from "next/navigation";
import { getRouteConfig } from "@/config/routes";

const { Title } = Typography;

interface PageTitleProps {
  styles: any;
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

