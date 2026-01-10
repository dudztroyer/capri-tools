"use client";
import React from "react";
import { Card, Row, Col, Spin, Typography, Statistic, Tag, Space, Alert } from "antd";
import { useTideData } from "@/hooks/useTideData";
import { CheckCircleOutlined, CloseCircleOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ALanchaPassa() {
  const { data, isLoading, error } = useTideData();

  const currentHeight = data?.current?.height ?? 0;
  const canPass = currentHeight >= 0.4 && currentHeight <= 1.4;
  const isTooLow = currentHeight < 0.4;
  const isTooHigh = currentHeight > 1.4;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erro ao carregar dados da maré"
        description="Não foi possível obter os dados da maré. Por favor, tente novamente mais tarde."
        type="error"
        showIcon
        style={{ marginTop: "24px" }}
      />
    );
  }

  return (
    <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
      <Col xs={24} md={12}>
        <Card
          title={
            <Space>
              <span>Status da Passagem</span>
              {canPass ? (
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Pode Passar
                </Tag>
              ) : (
                <Tag color="error" icon={<CloseCircleOutlined />}>
                  Não Pode Passar
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
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <Statistic
                title="Nível da Maré Atual"
                value={data?.current.height.toFixed(2)}
                suffix="m"
                valueStyle={{
                  color: canPass ? "#52c41a" : isTooLow ? "#ff4d4f" : "#faad14",
                  fontSize: "48px",
                  fontWeight: "bold",
                }}
              />
              <Text type="secondary" style={{ display: "block", marginTop: "8px" }}>
                {data?.current?.station}
              </Text>
              <Text type="secondary" style={{ display: "block", marginTop: "4px" }}>
                {data?.current?.timestamp && (
                  <>
                    {formatDate(data.current.timestamp)} às {formatTime(data.current.timestamp)}
                  </>
                )}
              </Text>
            </div>

            <Alert
              message={
                canPass
                  ? "Condições ideais para passagem"
                  : isTooLow
                  ? "Maré muito baixa - aguarde a maré subir"
                  : "Maré muito alta - aguarde a maré baixar"
              }
              description={
                canPass
                  ? `A maré está entre 0.4m e 1.4m (atual: ${data?.current.height.toFixed(2)}m). Você pode passar com segurança.`
                  : isTooLow
                  ? `A maré está muito baixa (${data?.current.height.toFixed(2)}m). É necessário que esteja entre 0.4m e 1.4m para passar.`
                  : `A maré está muito alta (${data?.current.height.toFixed(2)}m). É necessário que esteja entre 0.4m e 1.4m para passar.`
              }
              type={canPass ? "success" : "warning"}
              showIcon
              style={{ marginTop: "16px" }}
            />

            <div style={{ marginTop: "24px" }}>
              <Title level={5}>Requisitos para Passagem</Title>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <Text>
                  <Text strong>Altura mínima:</Text> 0.4m
                </Text>
                <Text>
                  <Text strong>Altura máxima:</Text> 1.4m
                </Text>
                <Text>
                  <Text strong>Altura atual:</Text>{" "}
                  <Text type={canPass ? "success" : "danger"}>
                    {data?.current.height.toFixed(2)}m
                  </Text>
                </Text>
              </Space>
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card
          title="Previsão de Marés"
          style={{
            height: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {data?.nextHigh && (
              <Card
                size="small"
                style={{
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #91d5ff",
                }}
              >
                <Statistic
                  title={
                    <Space>
                      <RiseOutlined style={{ color: "#1890ff" }} />
                      <span>Próxima Maré Alta</span>
                    </Space>
                  }
                  value={data.nextHigh.height.toFixed(2)}
                  suffix="m"
                  valueStyle={{ color: "#1890ff" }}
                />
                <Text type="secondary" style={{ display: "block", marginTop: "8px" }}>
                  {formatDate(data.nextHigh.timestamp)} às {formatTime(data.nextHigh.timestamp)}
                </Text>
                {data.nextHigh.height >= 0.4 && data.nextHigh.height <= 1.4 && (
                  <Tag color="success" style={{ marginTop: "8px" }}>
                    Boa para passagem
                  </Tag>
                )}
              </Card>
            )}

            {data?.nextLow && (
              <Card
                size="small"
                style={{
                  backgroundColor: "#fff7e6",
                  border: "1px solid #ffd591",
                }}
              >
                <Statistic
                  title={
                    <Space>
                      <FallOutlined style={{ color: "#fa8c16" }} />
                      <span>Próxima Maré Baixa</span>
                    </Space>
                  }
                  value={data.nextLow.height.toFixed(2)}
                  suffix="m"
                  valueStyle={{ color: "#fa8c16" }}
                />
                <Text type="secondary" style={{ display: "block", marginTop: "8px" }}>
                  {formatDate(data.nextLow.timestamp)} às {formatTime(data.nextLow.timestamp)}
                </Text>
                {data.nextLow.height >= 0.4 && data.nextLow.height <= 1.4 && (
                  <Tag color="success" style={{ marginTop: "8px" }}>
                    Boa para passagem
                  </Tag>
                )}
              </Card>
            )}

            <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <Title level={5}>Informações</Title>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Os dados são atualizados automaticamente a cada 5 minutos.
                A passagem é segura quando o nível da maré está entre 0.4m e 1.4m.
              </Text>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
