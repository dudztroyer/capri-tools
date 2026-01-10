"use client";
import React, { useState } from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import Image from "next/image";
import MenuContent from "./MenuContent";
import logo from "@/assets/logo horizontal.png";
import { AppStyles } from "@/types/styles";

interface MobileNavbarProps {
  styles: AppStyles;
}

export default function MobileNavbar({ styles }: MobileNavbarProps) {
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div style={styles.navbarMobile}>
      <div style={styles.navbarContainer}>
        <Image
          src={logo}
          alt="Logo"
          height={32}
          width={120}
          style={{ objectFit: "contain" }}
        />
        <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} />
        <Drawer
          title="Menu"
          placement="right"
          onClose={onClose}
          open={open}
          styles={{ body: { padding: 0 } }}
        >
          <MenuContent styles={styles} />
        </Drawer>
      </div>
    </div>
  );
}

