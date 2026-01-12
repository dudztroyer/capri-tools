"use client";
import React, { useState, useMemo } from "react";
import { Card, Typography, Tag, Divider, Alert } from "antd";
import {
    ClockCircleOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import {
    DayForecast,
    formatTime,
    isToday as checkIsToday,
    isTomorrow,
} from "@/services/fishingWeatherService";
import BayPointsVisualization from "./BayPointsVisualization";

const { Text, Title } = Typography;

interface TodayDetailedViewProps {
    forecast: DayForecast;
}

interface HourData {
    hour: number;
    pointA: { speed: number; direction: number; gusts: number; precip: number };
    pointB: { speed: number; direction: number; gusts: number; precip: number };
    pointC: { speed: number; direction: number; gusts: number; precip: number };
}

export default function TodayDetailedView({ forecast }: TodayDetailedViewProps) {
    // Ensure date is a Date object (it might be serialized as string from React Query)
    const forecastDate = typeof forecast.date === "string" ? new Date(forecast.date) : forecast.date;

    const isActuallyToday = checkIsToday(forecastDate);
    const isActuallyTomorrow = isTomorrow(forecastDate);

    const [selectedHour, setSelectedHour] = useState<number>(
        isActuallyToday ? new Date().getHours() : 8
    );

    const getDayTitle = (): string => {
        if (isActuallyToday) return "Hoje";
        if (isActuallyTomorrow) return "Amanhã";
        return forecastDate.toLocaleDateString("pt-BR", {
            weekday: "long",
        });
    };

    // Aggregate data by hour
    const hourlyData = useMemo((): HourData[] => {
        const hours: HourData[] = [];

        for (let hour = 5; hour <= 19; hour++) {
            const pointA = forecast.points.find((p) => p.pointId === "A");
            const pointB = forecast.points.find((p) => p.pointId === "B");
            const pointC = forecast.points.find((p) => p.pointId === "C");

            const getHourAvg = (point: typeof pointA, h: number) => {
                if (!point) return { speed: 0, direction: 0, gusts: 0, precip: 0 };
                const hourData = point.data.filter((d) => {
                    const ts = typeof d.timestamp === "string" ? new Date(d.timestamp) : d.timestamp;
                    return ts.getHours() === h;
                });
                if (hourData.length === 0)
                    return { speed: 0, direction: 0, gusts: 0, precip: 0 };

                return {
                    speed:
                        Math.round(
                            (hourData.reduce((a, b) => a + b.wind.speed, 0) / hourData.length) *
                            10
                        ) / 10,
                    direction: Math.round(
                        hourData.reduce((a, b) => a + b.wind.direction, 0) / hourData.length
                    ),
                    gusts:
                        Math.round(
                            (hourData.reduce((a, b) => a + b.wind.gusts, 0) / hourData.length) *
                            10
                        ) / 10,
                    precip:
                        Math.round(
                            hourData.reduce((a, b) => a + b.precipitation, 0) * 10
                        ) / 10,
                };
            };

            hours.push({
                hour,
                pointA: getHourAvg(pointA, hour),
                pointB: getHourAvg(pointB, hour),
                pointC: getHourAvg(pointC, hour),
            });
        }

        return hours;
    }, [forecast]);

    // Find key moments
    const windChangeHour = forecast.windChangeTime
        ? (typeof forecast.windChangeTime === "string" ? new Date(forecast.windChangeTime) : forecast.windChangeTime).getHours()
        : 13;

    return (
        <Card
            style={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(26, 54, 93, 0.15)",
                border: "none",
            }}
            styles={{
                body: { padding: 0 },
            }}
        >
            {/* Header gradient */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${forecast.overallCondition.color}ee, ${forecast.overallCondition.color}88)`,
                    padding: "24px",
                    color: "#fff",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
                    <div>
                        <Text
                            style={{
                                color: "rgba(255,255,255,0.8)",
                                fontSize: "13px",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                            }}
                        >
                            Previsão Detalhada
                        </Text>
                        <Title
                            level={2}
                            style={{ color: "#fff", margin: "4px 0 0 0", fontWeight: 700, textTransform: "capitalize" }}
                        >
                            {getDayTitle()}
                        </Title>
                        <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
                            {forecastDate.toLocaleDateString("pt-BR", {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                            })}
                        </Text>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "48px", marginBottom: "4px" }}>
                            {forecast.overallCondition.score === "excellent"
                                ? "🎣"
                                : forecast.overallCondition.score === "good"
                                    ? "👍"
                                    : forecast.overallCondition.score === "moderate"
                                        ? "⚠️"
                                        : forecast.overallCondition.score === "poor"
                                            ? "👎"
                                            : "🚫"}
                        </div>
                        <Tag
                            style={{
                                background: "rgba(255,255,255,0.2)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                color: "#fff",
                                borderRadius: "12px",
                                fontWeight: 600,
                            }}
                        >
                            {forecast.overallCondition.label}
                        </Tag>
                    </div>
                </div>

                {/* Time windows summary */}
                <div
                    style={{
                        marginTop: "20px",
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    {forecast.bestDepartureWindow && (
                        <div
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                padding: "10px 16px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <CheckCircleOutlined style={{ fontSize: "16px" }} />
                            <div>
                                <Text
                                    style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", display: "block" }}
                                >
                                    MELHOR SAÍDA
                                </Text>
                                <Text style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                                    {formatTime(forecast.bestDepartureWindow.start)} -{" "}
                                    {formatTime(forecast.bestDepartureWindow.end)}
                                </Text>
                            </div>
                        </div>
                    )}

                    {forecast.suggestedReturnWindow && (
                        <div
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                padding: "10px 16px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <ClockCircleOutlined style={{ fontSize: "16px" }} />
                            <div>
                                <Text
                                    style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", display: "block" }}
                                >
                                    VOLTAR ATÉ
                                </Text>
                                <Text style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                                    {formatTime(forecast.suggestedReturnWindow.end)}
                                </Text>
                            </div>
                        </div>
                    )}

                    {forecast.windChangeTime && (
                        <div
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                padding: "10px 16px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <ArrowRightOutlined style={{ fontSize: "16px" }} />
                            <div>
                                <Text
                                    style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", display: "block" }}
                                >
                                    VENTO MUDA
                                </Text>
                                <Text style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>
                                    ~{formatTime(forecast.windChangeTime)}
                                </Text>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "24px" }}>
                {/* Danger alerts */}
                {forecast.dangerWindows.length > 0 && (
                    <Alert
                        type="error"
                        icon={<WarningOutlined />}
                        title="Período de Risco"
                        description={`Evitar navegação das ${formatTime(
                            forecast.dangerWindows[0].start
                        )} às ${formatTime(
                            forecast.dangerWindows[0].end
                        )} - Ventos fortes previstos`}
                        style={{ marginBottom: "24px", borderRadius: "12px" }}
                        showIcon
                    />
                )}

                {/* Bay points visualization with timeline */}
                <div style={{ marginBottom: "24px" }}>
                    <BayPointsVisualization
                        points={forecast.points}
                        selectedHour={selectedHour}
                        onHourChange={setSelectedHour}
                        hourlyData={hourlyData}
                        windChangeHour={windChangeHour}
                        isActuallyToday={isActuallyToday}
                    />
                </div>

                {/* Daily summary */}
                <Divider style={{ margin: "16px 0" }} />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "16px",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <Text style={{ color: "#666", fontSize: "11px", display: "block" }}>
                            Vento Máx.
                        </Text>
                        <Text strong style={{ fontSize: "18px", color: "#1a365d" }}>
                            {forecast.summary.maxWindSpeed} km/h
                        </Text>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <Text style={{ color: "#666", fontSize: "11px", display: "block" }}>
                            Rajadas Máx.
                        </Text>
                        <Text strong style={{ fontSize: "18px", color: "#1a365d" }}>
                            {forecast.summary.maxGusts} km/h
                        </Text>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <Text style={{ color: "#666", fontSize: "11px", display: "block" }}>
                            Manhã Calma
                        </Text>
                        <Text strong style={{ fontSize: "18px", color: "#52c41a" }}>
                            {forecast.summary.calmMorningHours}h
                        </Text>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <Text style={{ color: "#666", fontSize: "11px", display: "block" }}>
                            Chuva Total
                        </Text>
                        <Text
                            strong
                            style={{
                                fontSize: "18px",
                                color: forecast.summary.totalPrecipitation > 0 ? "#1890ff" : "#52c41a",
                            }}
                        >
                            {forecast.summary.totalPrecipitation > 0
                                ? `${forecast.summary.totalPrecipitation}mm`
                                : "0mm ☀️"}
                        </Text>
                    </div>
                </div>
            </div>
        </Card>
    );
}
