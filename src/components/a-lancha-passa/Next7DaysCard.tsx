"use client";
import React from "react";
import { Card, List, Typography, Tag, Space } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { PassagemWindow } from "@/hooks/useLanchaPassa";
import PassagemWindowItem from "./PassagemWindowItem";

const { Text } = Typography;

interface Next7DaysCardProps {
  windows: PassagemWindow[];
}

export default function Next7DaysCard({ windows }: Next7DaysCardProps) {
  return (
    <Card
      title="Próximas 7 Dias"
      style={{
        height: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      {windows && windows.length > 0 ? (
        <List
          dataSource={windows}
          renderItem={(window) => <PassagemWindowItem window={window} />}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Sem janelas de passagem previstas nos próximos 7 dias</Text>
        </div>
      )}
    </Card>
  );
}

