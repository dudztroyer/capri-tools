"use client";
import React from "react";
import { Breadcrumb } from "antd";
import { usePathname } from "next/navigation";

export default function PageBreadcrumb() {
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

  return <Breadcrumb items={getBreadcrumbItems()} />;
}

