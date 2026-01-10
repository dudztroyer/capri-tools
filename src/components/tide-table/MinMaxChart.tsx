"use client";
import React from "react";
import { Card, Alert } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ChartDataPoint {
  day: number;
  min: number;
  max: number;
  avg: number;
}

interface MinMaxChartProps {
  chartData: ChartDataPoint[];
  isCurrentMonth: boolean;
  currentDay: number;
}

export default function MinMaxChart({ chartData, isCurrentMonth, currentDay }: MinMaxChartProps) {
  return (
    <Card
      title="Gráfico de Máximas e Mínimas durante o Mês"
      style={{
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      {chartData.length === 0 ? (
        <Alert
          message="Nenhum dado disponível"
          description="Não há dados de maré disponíveis para o mês selecionado."
          type="info"
          showIcon
        />
      ) : (
        <ResponsiveContainer width="100%" height={500}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              label={{ value: "Dia do Mês", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              label={{ value: "Altura (m)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(2)}m` : ""}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="min"
              stroke="#ff4d4f"
              strokeWidth={2}
              name="Mínima"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#1890ff"
              strokeWidth={2}
              name="Máxima"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#52c41a"
              strokeWidth={2}
              name="Média"
              dot={{ r: 4 }}
            />
            {isCurrentMonth && (
              <ReferenceLine
                x={currentDay}
                stroke="#faad14"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: "Hoje", position: "top", fill: "#faad14" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

