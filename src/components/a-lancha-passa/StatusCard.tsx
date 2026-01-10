"use client";
import React from "react";
import { Card, Space, Tag, Alert, Divider, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import { LanchaPassaData } from "@/hooks/useLanchaPassa";
import { formatDateTime } from "./utils";

const { Title, Text } = Typography;

interface StatusCardProps {
  data: LanchaPassaData;
}

export default function StatusCard({ data }: StatusCardProps) {
  return (
    <Card
      title={
        <Space>
          <span>Status Atual</span>
          {data.isPassingNow ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Passando Agora
            </Tag>
          ) : (
            <Tag color="default" icon={<CloseCircleOutlined />}>
              Não Está Passando
            </Tag>
          )}
        </Space>
      }
      style={{
        height: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <Space orientation="vertical" style={{ width: "100%" }}>
        {data.isPassingNow ? (
          <Alert
            title="A lancha está passando agora!"
            description={
              data.currentWindowEnd
                ? `Pode passar até ${formatDateTime(new Date(data.currentWindowEnd))}`
                : "Condições ideais para passagem no momento."
            }
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        ) : (
          <Alert
            title="A lancha não está passando no momento"
            description="Aguarde uma janela de passagem adequada."
            type="info"
            showIcon
          />
        )}

        {data.currentDirection && (
          <>
            <Divider />
            <div>
              <Title level={5}>Estado da Maré</Title>
              <Text>
                A maré está{" "}
                <Text strong type={data.currentDirection === "up" ? "success" : "warning"}>
                  {data.currentDirection === "up" ? "subindo" : "descendo"}
                </Text>
              </Text>
            </div>
          </>
        )}

        <Divider />

        <div>
          <Title level={5}>
            <ClockCircleOutlined /> Última Passada
          </Title>
          {data.lastPassage ? (
            <Text>{formatDateTime(new Date(data.lastPassage))}</Text>
          ) : (
            <Text type="secondary">Sem registro de passada recente</Text>
          )}
        </div>

        <Divider />

        <div>
          <Title level={5}>
            <CalendarOutlined /> Próxima Passada
          </Title>
          {data.nextPassage ? (
            <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
              {formatDateTime(new Date(data.nextPassage))}
            </Text>
          ) : (
            <Text type="secondary">Sem previsão de próxima passada</Text>
          )}
        </div>

        <Divider />

        <div style={{ padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <Title level={5}>Requisitos para Passagem</Title>
          <Space orientation="vertical" size="small" style={{ width: "100%" }}>
            <Text>
              <Text strong>Altura mínima:</Text> 0.4m
            </Text>
            <Text>
              <Text strong>Altura máxima:</Text> 1.4m
            </Text>
          </Space>
        </div>
      </Space>
    </Card>
  );
}

