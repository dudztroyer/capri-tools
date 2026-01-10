"use client";
import React, { useMemo } from "react";
import { Card, Button, Typography, Space, Dropdown } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, EllipsisOutlined } from "@ant-design/icons";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush,
    ReferenceLine,
    ComposedChart,
    Area,
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
    onGoToToday: () => void;
    onGoToTomorrow: () => void;
}

export default function ContinuousTideChart({
    data,
    isCurrentMonth,
    brushRange,
    initialBrushRange,
    onBrushChange,
    onGoToNow,
    onGoToToday,
    onGoToTomorrow,
}: ContinuousTideChartProps) {
    // Calculate current brush range
    const currentStartIndex = brushRange ? brushRange[0] : (initialBrushRange ? initialBrushRange[0] : 0);
    const currentEndIndex = brushRange ? brushRange[1] : (initialBrushRange ? initialBrushRange[1] : Math.min(50, data.length - 1));

    // Calculate fixed brush size (26 hours = 52 points at 15min intervals)
    const fixedBrushSize = 13 * 4; // 52 points = 13 hours * 4 points per hour

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

    // Calculate current timestamp for reference line
    const currentTimestamp = useMemo(() => {
        if (!isCurrentMonth || data.length === 0) return null;

        const now = new Date();
        const currentDay = now.getDate();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Round to nearest 15-minute interval (0, 15, 30, 45)
        const roundedMinute = Math.round(currentMinute / 15) * 15;
        const finalMinute = roundedMinute >= 60 ? 0 : roundedMinute;
        const finalHour = roundedMinute >= 60 ? currentHour + 1 : currentHour;

        // Format timestamp to match data format
        const hourStr = finalHour.toString().padStart(2, "0");
        const minuteStr = finalMinute.toString().padStart(2, "0");
        const timestamp = `${currentDay}/${hourStr}:${minuteStr}`;

        // Check if this timestamp exists in data
        const existsInData = data.some((point) => point.timestamp === timestamp);
        return existsInData ? timestamp : null;
    }, [data, isCurrentMonth]);

    // Get current day for brush marking
    const currentDay = useMemo(() => {
        if (!isCurrentMonth) return null;
        return new Date().getDate();
    }, [isCurrentMonth]);

    // Prepare data for brush highlighting current day
    const brushDataWithHighlight = useMemo(() => {
        if (currentDay === null || !isCurrentMonth) return data;
        
        // Create a separate data array for current day highlight
        const currentDayData = data.filter((point) => point.day === currentDay);
        const maxHeight = Math.max(...data.map(p => p.height), 0);
        
        return data.map((point) => ({
            ...point,
            currentDayHeight: point.day === currentDay ? point.height : null,
            highlightMax: point.day === currentDay ? maxHeight * 1.1 : null,
        }));
    }, [data, currentDay, isCurrentMonth]);

    // Custom tick renderer for XAxis
    const customTick = (props: { x?: number; y?: number; payload?: { value: string } }) => {
        const { x = 0, y = 0, payload } = props;
        if (!payload) return null;

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

                        <Space.Compact>
                            <Button type="primary" onClick={onGoToNow}><ArrowLeftOutlined /></Button>
                            <Button type="primary" onClick={onGoToNow}>Ir para Agora</Button>
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: "today",
                                            label: "Ir para Hoje",
                                            onClick: onGoToToday,
                                        },
                                        {
                                            key: "tomorrow",
                                            label: "Ir para Amanhã",
                                            onClick: onGoToTomorrow,
                                        },
                                    ],
                                }}

                            >

                                <Button icon={<EllipsisOutlined />} type="primary" />
                            </Dropdown>
                            
                            <Button type="primary" onClick={onGoToNow}><ArrowRightOutlined /></Button>
                        </Space.Compact>
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
                        {/* Add reference line for current timestamp */}
                        {currentTimestamp && (
                            <ReferenceLine
                                x={currentTimestamp}
                                stroke="#faad14"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Agora",
                                    position: "top",
                                    fill: "#faad14",
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                            />
                        )}
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
                            tickFormatter={(value: string) => {
                                // Extract day from timestamp (format: "day/hour:minute")
                                const dayMatch = value.match(/^(\d+)\//);
                                if (dayMatch && currentDay !== null) {
                                    const day = parseInt(dayMatch[1], 10);
                                    if (day === currentDay) {
                                        return `📅 ${value}`;
                                    }
                                }
                                return value;
                            }}
                            onChange={(range: { startIndex?: number; endIndex?: number } | null) => {
                                if (range && typeof range.startIndex === 'number' && typeof range.endIndex === 'number') {
                                    // Always maintain fixed size - calculate center and apply fixed size
                                    const center = Math.floor((range.startIndex + range.endIndex) / 2);

                                    // Force fixed size (26 hours = 52 points)
                                    const newStartIndex = Math.max(0, center - fixedBrushSize);
                                    const newEndIndex = Math.min(data.length - 1, center + fixedBrushSize);

                                    // Only update if the range actually changed to avoid infinite loops
                                    const currentStart = brushRange ? brushRange[0] : (initialBrushRange ? initialBrushRange[0] : 0);
                                    const currentEnd = brushRange ? brushRange[1] : (initialBrushRange ? initialBrushRange[1] : Math.min(50, data.length - 1));

                                    if (newStartIndex !== currentStart || newEndIndex !== currentEnd) {
                                        onBrushChange([newStartIndex, newEndIndex]);
                                    }
                                }
                            }}
                        >
                            <ComposedChart data={brushDataWithHighlight}>
                                {/* Background highlight area for current day */}
                                {currentDay !== null && isCurrentMonth && (
                                    <Area
                                        dataKey="highlightMax"
                                        fill="#faad14"
                                        fillOpacity={0.15}
                                        stroke="none"
                                    />
                                )}
                                {/* Main tide data area */}
                                <Area 
                                    dataKey="height" 
                                    fill="#8884d8" 
                                    fillOpacity={0.3}
                                    stroke="#8884d8"
                                    strokeWidth={1}
                                />
                                {/* Reference lines at start and end of current day */}
                        {/* Add reference line for current timestamp */}
                        {currentTimestamp && (
                            <ReferenceLine
                                x={currentTimestamp}
                                stroke="#faad14"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Agora",
                                    position: "top",
                                    fill: "#faad14",
                                    fontSize: 12,
                                    fontWeight: "bold",
                                }}
                            />
                        )}
                            </ComposedChart>
                        </Brush>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

