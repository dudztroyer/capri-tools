"use client";
import React from "react";
import { Card, Row, Col, Typography, Space } from "antd";

interface ChartDataPoint {
  day: number;
  min: number;
  max: number;
  avg: number;
}

interface TideStatisticsProps {
  chartData: ChartDataPoint[];
  selectedMonth: number;
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

export default function TideStatistics({ chartData, selectedMonth }: TideStatisticsProps) {
  if (chartData.length === 0) return null;

  return (
    <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
      <Col xs={24} md={8}>
        <Card
          title="Estatísticas do Mês"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          <Space orientation="vertical" style={{ width: "100%" }}>
            <div>
              <Typography.Text strong>Altura Mínima: </Typography.Text>
              <Typography.Text type="danger">
                {Math.min(...chartData.map((d) => d.min)).toFixed(2)}m
              </Typography.Text>
            </div>
            <div>
              <Typography.Text strong>Altura Máxima: </Typography.Text>
              <Typography.Text style={{ color: "#1890ff" }}>
                {Math.max(...chartData.map((d) => d.max)).toFixed(2)}m
              </Typography.Text>
            </div>
            <div>
              <Typography.Text strong>Altura Média: </Typography.Text>
              <Typography.Text type="success">
                {(
                  chartData.reduce((sum, d) => sum + d.avg, 0) / chartData.length
                ).toFixed(2)}m
              </Typography.Text>
            </div>
          </Space>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card
          title="Informações"
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          <Typography.Paragraph>
            Este gráfico mostra a variação das marés ao longo do mês de{" "}
            <strong>{monthNames[selectedMonth - 1]}</strong>. As linhas
            representam:
          </Typography.Paragraph>
          <ul>
            <li>
              <Typography.Text strong style={{ color: "#ff4d4f" }}>
                Mínima:
              </Typography.Text>{" "}
              Menor altura da maré registrada em cada dia
            </li>
            <li>
              <Typography.Text strong style={{ color: "#1890ff" }}>
                Máxima:
              </Typography.Text>{" "}
              Maior altura da maré registrada em cada dia
            </li>
            <li>
              <Typography.Text strong style={{ color: "#52c41a" }}>
                Média:
              </Typography.Text>{" "}
              Altura média da maré ao longo do dia
            </li>
          </ul>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            Os dados são obtidos da API de Tábua de Maré e são armazenados
            em cache para evitar requisições desnecessárias.
          </Typography.Text>
        </Card>
      </Col>
    </Row>
  );
}

