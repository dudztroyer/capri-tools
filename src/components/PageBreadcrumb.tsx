"use client";
import React from "react";
import { Breadcrumb } from "antd";
import { usePathname } from "next/navigation";
import { getRouteConfig } from "@/config/routes";

export default function PageBreadcrumb() {
  const pathname = usePathname();
  const config = getRouteConfig(pathname);

  const breadcrumbItems = config.breadcrumb.map((title) => ({
    title,
  }));

  return <Breadcrumb items={breadcrumbItems} />;
}

