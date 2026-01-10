"use client";
import React, { useMemo } from "react";
import { Card, Button, Typography, Space } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from "recharts";

interface ContinuousDataPoint {
  day: number;
  hour: number;
  minute: number;
  timestamp: string;
  height: number;
  sortKey: number;
  isDirectionChange?: boolean;
  direction?: "up" | "down";
}

interface ContinuousTideChartProps {
  data: ContinuousDataPoint[];
  isCurrentMonth: boolean;
  brushRange: [number, number] | null;
  initialBrushRange: [number, number] | null;
  onBrushChange: (range: [number, number]) => void;
  onGoToNow: () => void;
}

export default function ContinuousTideChart({
  data,
  isCurrentMonth,
  brushRange,
  initialBrushRange,
  onBrushChange,
  onGoToNow,
}: ContinuousTideChartProps) {
  // Calculate current brush range
  const currentStartIndex = brushRange ? brushRange[0] : (initialBrushRange ? initialBrushRange[0] : 0);
  const currentEndIndex = brushRange ? brushRange[1] : (initialBrushRange ? initialBrushRange[1] : Math.min(50, data.length - 1));

  // Get selected period
  const selectedPeriod = useMemo(() => {
    if (data.length === 0) return null;
    const startPoint = data[Math.max(0, currentStartIndex)];
    const endPoint = data[Math.min(data.length - 1, currentEndIndex)];
    if (!startPoint || !endPoint) return null;
    return {
      start: startPoint.timestamp,
      end: endPoint.timestamp,
    };
  }, [data, currentStartIndex, currentEndIndex]);

  // Get direction change points
  const directionChangePoints = useMemo(() => {
    return data.filter((point) => point.isDirectionChange);
  }, [data]);

  // Create a set of direction change timestamps for quick lookup
  const directionChangeTimestamps = useMemo(() => {
    return new Set(directionChangePoints.map((point) => point.timestamp));
  }, [directionChangePoints]);

  // Custom tick renderer for XAxis
  const customTick = (props: { x?: number; y?: number; payload?: { value: string } }) => {
    const { x = 0, y = 0, payload } = props;
    if (!payload) return null;
    const isDirectionChange = directionChangeTimestamps.has(payload.value);
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          fontSize={11}
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
        {isDirectionChange && (
          <circle
            cx={0}
            cy={-5}
            r={4}
            fill="#1890ff"
            stroke="#fff"
            strokeWidth={1}
          />
        )}
      </g>
    );
  };

  if (data.length === 0) return null;

  return (
    <Card
      title="Gráfico Contínuo da Maré - Mês Completo"
      extra={
        <Space>
          {selectedPeriod && (
            <Typography.Text type="secondary">
              Período: {selectedPeriod.start} - {selectedPeriod.end}
            </Typography.Text>
          )}
          {isCurrentMonth && (
            <Button type="primary" onClick={onGoToNow}>
              Ir para Agora
            </Button>
          )}
        </Space>
      }
      style={{
        marginTop: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <div style={{ overflowX: "auto", width: "100%", overflowY: "hidden" }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 80,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                angle={-45}
                textAnchor="end"
                height={100}
                // interval={Math.floor(data.length)}
                tick={customTick}
                label={{ value: "Dia/Hora", position: "insideBottom" }}
              />
              <YAxis
                label={{ value: "Altura (m)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(2)}m` : ""}
                labelFormatter={(label) => `Horário: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="height"
                stroke="#1890ff"
                strokeWidth={2}
                name="Altura da Maré (m)"
                dot={(props: { payload?: ContinuousDataPoint; cx?: number; cy?: number }) => {
                  const { payload, cx, cy } = props;
                  if (payload?.isDirectionChange && cx !== undefined && cy !== undefined) {
                    const iconSize = 16;
                    const color = payload.direction === "up" ? "#52c41a" : "#ff4d4f";
                    const symbol = payload.direction === "up" ? "↑" : "↓";
                    return (
                      <g>
                        <text
                          x={cx}
                          y={cy - 10}
                          fill={color}
                          fontSize={iconSize}
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {symbol}
                        </text>
                      </g>
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 6 }}
              />
              {/* Add reference lines for direction changes */}
              {directionChangePoints.map((point, index) => (
                <ReferenceLine
                  key={`ref-${index}`}
                  x={point.timestamp}
                  stroke={point.direction === "up" ? "#52c41a" : "#ff4d4f"}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              ))}
              <Brush
                dataKey="timestamp"
                stroke="#8884d8"
                alwaysShowText
                startIndex={brushRange ? brushRange[0] : (initialBrushRange ? initialBrushRange[0] : 0)}
                endIndex={brushRange ? brushRange[1] : (initialBrushRange ? initialBrushRange[1] : Math.min(50, data.length - 1))}
                onChange={(range: { startIndex?: number; endIndex?: number } | null) => {
                  if (range && typeof range.startIndex === 'number' && typeof range.endIndex === 'number') {
                    onBrushChange([range.startIndex, range.endIndex]);
                  }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
      </div>
    </Card>
  );
}

