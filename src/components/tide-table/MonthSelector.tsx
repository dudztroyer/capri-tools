"use client";
import React from "react";
import { Card, Select, Typography, Space } from "antd";
import { TideTableResponse } from "@/services/tideService";

const { Option } = Select;
const { Text } = Typography;

interface MonthSelectorProps {
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  data?: TideTableResponse;
}

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

export default function MonthSelector({ selectedMonth, onMonthChange, data }: MonthSelectorProps) {
  return (
    <Card
      title="Selecionar Mês"
      style={{
        marginBottom: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <Space style={{ width: "100%" }}>
        <Text strong>Mês: </Text>
        <Select
          value={selectedMonth}
          onChange={onMonthChange}
          style={{ width: 200 }}
          size="large"
        >
          {monthOptions.map((month) => (
            <Option key={month} value={month}>
              {monthNames[month - 1]}
            </Option>
          ))}
        </Select>
        {data?.harborName && (
          <>
            <Text type="secondary">|</Text>
            <Text type="secondary">
              {data.harborName}
              {data?.year && ` - ${data.year}`}
            </Text>
          </>
        )}
      </Space>
    </Card>
  );
}

