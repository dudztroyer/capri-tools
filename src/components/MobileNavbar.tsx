"use client";
import React, { useState } from "react";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import MenuContent from "./MenuContent";

interface MobileNavbarProps {
  styles: any;
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
        Logo
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

