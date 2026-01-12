"use client";
import React from "react";
import { Card, Typography, Tag, Tooltip } from "antd";
import {
    SunOutlined,
    CloudOutlined,
    ThunderboltOutlined,
    WarningOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import {
    DayForecast,
    isToday,
    isTomorrow,
    formatTime,
    getWindDirectionArrow,
} from "@/services/fishingWeatherService";

const { Text } = Typography;

interface ForecastDayCardProps {
    forecast: DayForecast;
    onClick?: () => void;
    isSelected?: boolean;
}

export default function ForecastDayCard({
    forecast,
    onClick,
    isSelected,
}: ForecastDayCardProps) {
    // Ensure date is a Date object (it might be serialized as string from React Query)
    const forecastDate = typeof forecast.date === "string" ? new Date(forecast.date) : forecast.date;

    const today = isToday(forecastDate);
    const tomorrow = isTomorrow(forecastDate);

    const getDayLabel = (): string => {
        if (today) return "Hoje";
        if (tomorrow) return "Amanhã";
        return forecastDate.toLocaleDateString("pt-BR", {
            weekday: "short",
        });
    };

    const getDateLabel = (): string => {
        return forecastDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
        });
    };

    const getConditionIcon = () => {
        const size = "20px";
        switch (forecast.overallCondition.score) {
            case "excellent":
                return <SunOutlined style={{ color: "#1890ff", fontSize: size }} />;
            case "good":
                return <SunOutlined style={{ color: "#52c41a", fontSize: size }} />;
            case "moderate":
                return <CloudOutlined style={{ color: "#faad14", fontSize: size }} />;
            case "poor":
                return <CloudOutlined style={{ color: "#fa8c16", fontSize: size }} />;
            case "dangerous":
                return <ThunderboltOutlined style={{ color: "#ff4d4f", fontSize: size }} />;
        }
    };

    const getScoreEmoji = (): string => {
        switch (forecast.overallCondition.score) {
            case "excellent":
                return "🎣";
            case "good":
                return "👍";
            case "moderate":
                return "⚠️";
            case "poor":
                return "👎";
            case "dangerous":
                return "🚫";
        }
    };

    // Get morning and afternoon wind info from point C (worst case)
    const pointC = forecast.points.find((p) => p.pointId === "C");
    const morningData = pointC?.data.find((d) => {
        const ts = typeof d.timestamp === "string" ? new Date(d.timestamp) : d.timestamp;
        return ts.getHours() === 8;
    });
    const afternoonData = pointC?.data.find((d) => {
        const ts = typeof d.timestamp === "string" ? new Date(d.timestamp) : d.timestamp;
        return ts.getHours() === 15;
    });

    return (
        <Card
            hoverable
            onClick={onClick}
            style={{
                borderRadius: "12px",
                border: isSelected
                    ? `2px solid ${forecast.overallCondition.color}`
                    : today
                        ? "2px solid #1890ff"
                        : "1px solid #e8e8e8",
                boxShadow: isSelected
                    ? `0 4px 16px ${forecast.overallCondition.color}33`
                    : "0 2px 8px rgba(0,0,0,0.06)",
                overflow: "hidden",
                transition: "all 0.2s ease",
                background: isSelected
                    ? `linear-gradient(135deg, ${forecast.overallCondition.color}08, ${forecast.overallCondition.color}15)`
                    : "#fff",
            }}
            styles={{
                body: { padding: "12px 16px" },
            }}
        >
            {/* Grid layout */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr auto",
                    alignItems: "center",
                    gap: "12px",
                }}
            >
                {/* Day info + icons below */}
                <div style={{ textAlign: "center" }}>
                    <Text
                        strong
                        style={{
                            fontSize: "14px",
                            color: today ? "#1890ff" : isSelected ? forecast.overallCondition.color : "#1a365d",
                            display: "block",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {getDayLabel()}
                    </Text>
                    <Text style={{ color: "#888", fontSize: "12px", whiteSpace: "nowrap", display: "block" }}>{getDateLabel()}</Text>
                    {/* Condition icon and emoji */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "4px" }}>
                        {getConditionIcon()}
                        <span style={{ fontSize: "16px" }}>{getScoreEmoji()}</span>
                    </div>
                </div>

                {/* Wind info - center section */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    {morningData && (
                        <Tooltip title="Vento pela manhã (8h)">
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                                <SunOutlined style={{ color: "#faad14", fontSize: "12px" }} />
                                <Text style={{ fontSize: "12px" }}>
                                    {getWindDirectionArrow(morningData.wind.direction)} {morningData.wind.speed}
                                </Text>
                            </div>
                        </Tooltip>
                    )}
                    {afternoonData && (
                        <Tooltip title="Vento à tarde (15h)">
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                                <CloudOutlined style={{ color: "#1890ff", fontSize: "12px" }} />
                                <Text
                                    style={{
                                        fontSize: "12px",
                                        color: afternoonData.wind.speed > 15 ? "#fa8c16" : undefined,
                                    }}
                                >
                                    {getWindDirectionArrow(afternoonData.wind.direction)} {afternoonData.wind.speed}
                                </Text>
                            </div>
                        </Tooltip>
                    )}
                    <Text style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap" }}>
                        Máx: <Text strong style={{
                            color: forecast.summary.maxWindSpeed > 20 ? "#ff4d4f" :
                                forecast.summary.maxWindSpeed > 15 ? "#fa8c16" : "#666",
                            fontSize: "11px"
                        }}>
                            {forecast.summary.maxWindSpeed}
                        </Text>
                        {forecast.summary.totalPrecipitation > 0 && " 🌧️"}
                    </Text>
                </div>

                {/* Right section - stacked vertically */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    {/* Condition badge */}
                    <Tag
                        color={forecast.overallCondition.color}
                        style={{
                            borderRadius: "6px",
                            padding: "2px 10px",
                            fontSize: "11px",
                            fontWeight: 600,
                            margin: 0,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {forecast.overallCondition.label}
                    </Tag>

                    {/* Time windows */}
                    {forecast.bestDepartureWindow && (
                        <Tooltip title={`Saída: ${formatTime(forecast.bestDepartureWindow.start)} - ${formatTime(forecast.bestDepartureWindow.end)}`}>
                            <Tag
                                color="success"
                                style={{ margin: 0, fontSize: "10px", padding: "1px 6px", borderRadius: "4px" }}
                                icon={<CheckCircleOutlined />}
                            >
                                {formatTime(forecast.bestDepartureWindow.start)}
                            </Tag>
                        </Tooltip>
                    )}
                    {forecast.dangerWindows.length > 0 && (
                        <Tooltip title={`Perigo: ${formatTime(forecast.dangerWindows[0].start)} - ${formatTime(forecast.dangerWindows[0].end)}`}>
                            <Tag
                                color="error"
                                style={{ margin: 0, fontSize: "10px", padding: "1px 6px", borderRadius: "4px" }}
                                icon={<WarningOutlined />}
                            >
                                {formatTime(forecast.dangerWindows[0].start)}
                            </Tag>
                        </Tooltip>
                    )}
                </div>
            </div>
        </Card>
    );
}
