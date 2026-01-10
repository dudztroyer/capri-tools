"use client";
import React from "react";
import { Typography, Tag, Space } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { PassagemWindow } from "@/hooks/useLanchaPassa";
import { formatTime, formatDateOnly } from "./utils";

const { Text } = Typography;

interface PassagemWindowItemProps {
  window: PassagemWindow;
}

export default function PassagemWindowItem({ window }: PassagemWindowItemProps) {
  const startDate = new Date(window.start);
  const endDate = new Date(window.end);
  const duration = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60)
  );
  
  const isDifferentDay = startDate.toDateString() !== endDate.toDateString();

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <CalendarOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
      </div>
      <div style={{ flex: 1 }}>
        <Space orientation="vertical" size={4} style={{ width: "100%" }}>
          <Space>
            <Text strong>
              {isDifferentDay 
                ? `${formatDateOnly(startDate)} até ${formatDateOnly(endDate)}`
                : formatDateOnly(startDate)
              }
            </Text>
            <Tag color="success">Janela de Passagem</Tag>
          </Space>
          <Space orientation="vertical" size={0}>
            <Text>
              <Text strong>Início:</Text> {formatTime(startDate)}
            </Text>
            <Text>
              <Text strong>Fim:</Text> {isDifferentDay 
                ? `${formatDateOnly(endDate)} às ${formatTime(endDate)}`
                : formatTime(endDate)
              }
            </Text>
            <Text>
              <Text strong>Maré:</Text>{" "}
              {window.initialDirection ? (
                <>
                  <Text type={window.initialDirection === "up" ? "success" : "warning"}>
                    {window.initialDirection === "up" ? "Subindo" : "Descendo"}
                  </Text>
                  {(window.risingCount > 0 || window.fallingCount > 0) && (
                    <>
                      {" "}
                      <Text type="secondary">(</Text>
                      {window.risingCount > 0 && (
                        <Text type="success">
                          {window.risingCount}x subindo
                        </Text>
                      )}
                      {window.risingCount > 0 && window.fallingCount > 0 && " / "}
                      {window.fallingCount > 0 && (
                        <Text type="warning">
                          {window.fallingCount}x descendo
                        </Text>
                      )}
                      <Text type="secondary">)</Text>
                    </>
                  )}
                </>
              ) : (
                <Text type="secondary">Direção não disponível</Text>
              )}
            </Text>
            <Text type="secondary">
              Duração: {duration} minutos
            </Text>
          </Space>
        </Space>
      </div>
    </div>
  );
}

