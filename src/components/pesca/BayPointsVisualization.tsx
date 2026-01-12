"use client";
import React, { useState } from "react";
import { Typography, Tag, Segmented } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import {
    BayPointWeather,
    WeatherDataPoint,
    getWindDirectionArrow,
    evaluateCondition,
} from "@/services/fishingWeatherService";
import { getVentuskyUrl } from "./mapUrls";

const { Text } = Typography;

type ReferencePoint = "C" | "B";

interface BayPointsVisualizationProps {
    points: BayPointWeather[];
    selectedHour: number;
    onHourChange: (hour: number) => void;
    hourlyData: Array<{
        hour: number;
        pointB: { speed: number; gusts: number; precip: number };
        pointC: { speed: number; gusts: number; precip: number };
    }>;
    windChangeHour: number;
    isActuallyToday: boolean;
}

interface PointDisplayProps {
    point: BayPointWeather;
    currentData: WeatherDataPoint;
}

function PointDisplay({ point, currentData }: PointDisplayProps) {
    // Guard against undefined currentData
    const safeData = currentData ?? {
        timestamp: new Date(),
        wind: { direction: 0, speed: 0, gusts: 0 },
        precipitation: 0,
        temperature: 0,
    };

    const condition = evaluateCondition(
        safeData.wind.speed,
        safeData.wind.gusts,
        safeData.precipitation
    );

    const ventuskyUrl = getVentuskyUrl(point.coordinates.lat, point.coordinates.lng);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
            }}
        >
            {/* Point name with Ventusky link */}
            <a
                href={ventuskyUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    color: "#1a365d",
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "12px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                }}
            >
                {point.pointName}
                <span style={{ fontSize: "10px", opacity: 0.6 }}>🔗</span>
            </a>

            {/* Point marker with wind direction */}
            <div
                style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${condition.color}dd, ${condition.color}88)`,
                    border: `3px solid ${condition.color}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 20px ${condition.color}44`,
                    marginBottom: "12px",
                }}
            >
                {/* Wind arrow */}
                <span
                    style={{
                        fontSize: "28px",
                        color: "#fff",
                        transform: `rotate(${safeData.wind.direction}deg)`,
                        transition: "transform 0.3s ease",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                >
                    ↑
                </span>
            </div>

            {/* Wind data card */}
            <div
                style={{
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    minWidth: "100px",
                }}
            >
                {/* Wind speed */}
                <div style={{ marginBottom: "4px" }}>
                    <Text style={{ fontSize: "11px", color: "#666", display: "block" }}>
                        Vento
                    </Text>
                    <Text
                        strong
                        style={{ fontSize: "18px", color: "#1a365d", display: "block" }}
                    >
                        {safeData.wind.speed}{" "}
                        <span style={{ fontSize: "11px", fontWeight: 400 }}>km/h</span>
                    </Text>
                </div>

                {/* Gusts */}
                <div style={{ marginBottom: "4px" }}>
                    <Text style={{ fontSize: "10px", color: "#888" }}>
                        Rajadas: {safeData.wind.gusts} km/h
                    </Text>
                </div>

                {/* Precipitation */}
                <div style={{ marginBottom: "8px" }}>
                    <Text style={{ fontSize: "10px", color: safeData.precipitation > 0 ? "#1890ff" : "#888" }}>
                        {safeData.precipitation > 0 ? `🌧️ ${safeData.precipitation} mm` : "☀️ Sem chuva"}
                    </Text>
                </div>

                {/* Direction */}
                <div style={{ marginBottom: "8px" }}>
                    <Text style={{ fontSize: "11px", color: "#666" }}>
                        {getWindDirectionArrow(safeData.wind.direction)} {safeData.wind.direction}°
                    </Text>
                </div>

                {/* Condition tag */}
                <Tag
                    color={condition.color}
                    style={{
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: 600,
                        margin: 0,
                    }}
                >
                    {condition.label}
                </Tag>
            </div>
        </div>
    );
}

function ArrowConnector() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                marginTop: "40px",
            }}
        >
            <svg
                width="40"
                height="16"
                viewBox="0 0 40 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <line
                    x1="0"
                    y1="8"
                    x2="32"
                    y2="8"
                    stroke="#1a365d"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    d="M28 3L36 8L28 13"
                    stroke="#1a365d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
        </div>
    );
}

export default function BayPointsVisualization({
    points,
    selectedHour,
    onHourChange,
    hourlyData,
    windChangeHour,
    isActuallyToday,
}: BayPointsVisualizationProps) {
    const [referencePoint, setReferencePoint] = useState<ReferencePoint>("C");

    // Get current data for each point at selected hour
    const getDataForHour = (point: BayPointWeather, hour: number): WeatherDataPoint => {
        const found = point.data.find((d) => {
            const ts = typeof d.timestamp === "string" ? new Date(d.timestamp) : d.timestamp;
            return ts.getHours() === hour && ts.getMinutes() === 0;
        });
        return found || point.data.find((d) => {
            const ts = typeof d.timestamp === "string" ? new Date(d.timestamp) : d.timestamp;
            return ts.getHours() === hour;
        }) || point.data[0];
    };

    const pointA = points.find((p) => p.pointId === "A");
    const pointB = points.find((p) => p.pointId === "B");
    const pointC = points.find((p) => p.pointId === "C");

    if (!pointA || !pointB || !pointC) return null;

    const dataA = getDataForHour(pointA, selectedHour);
    const dataB = getDataForHour(pointB, selectedHour);
    const dataC = getDataForHour(pointC, selectedHour);

    // Get data for selected reference point
    const getPointData = (h: { pointB: { speed: number; gusts: number; precip: number }; pointC: { speed: number; gusts: number; precip: number } }) => {
        return referencePoint === "C" ? h.pointC : h.pointB;
    };

    return (
        <div
            style={{
                background: "linear-gradient(180deg, #e8f4fd 0%, #c5e3f6 50%, #a8d4f0 100%)",
                borderRadius: "16px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(74, 144, 194, 0.2)",
            }}
        >
            {/* Decorative waves */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' opacity='.15' fill='%23fff'%3E%3C/path%3E%3Cpath d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' opacity='.3' fill='%23fff'%3E%3C/path%3E%3Cpath d='M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z' opacity='.5' fill='%23fff'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: "cover",
                    opacity: 0.4,
                }}
            />

            {/* Header with title and selectors */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    position: "relative",
                    zIndex: 1,
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                <Text
                    style={{
                        color: "#1a365d",
                        fontSize: "14px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    Condições de Navegação
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Segmented
                        size="small"
                        value={referencePoint}
                        onChange={(value) => setReferencePoint(value as ReferencePoint)}
                        options={[
                            { label: "Ilhas", value: "B" },
                            { label: "Mar Aberto", value: "C" },
                        ]}
                        style={{
                            background: "rgba(255,255,255,0.7)",
                        }}
                    />
                    <Tag
                        color="blue"
                        style={{
                            borderRadius: "12px",
                            fontWeight: 600,
                            fontSize: "14px",
                            padding: "4px 12px",
                            margin: 0,
                        }}
                    >
                        <ClockCircleOutlined style={{ marginRight: "6px" }} />
                        {selectedHour.toString().padStart(2, "0")}:00
                    </Tag>
                </div>
            </div>

            {/* Timeline visualization */}
            <div
                style={{
                    marginBottom: "20px",
                    paddingTop: "18px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "2px",
                        borderRadius: "8px",
                        overflow: "visible",
                    }}
                >
                    {hourlyData.map((h) => {
                        const pointData = getPointData(h);
                        const condition = evaluateCondition(
                            pointData.speed,
                            pointData.gusts,
                            pointData.precip
                        );
                        const isCurrentHour = isActuallyToday && h.hour === new Date().getHours();
                        const isWindChange = h.hour === windChangeHour;
                        const hasRain = pointData.precip > 0;

                        return (
                            <div
                                key={h.hour}
                                onClick={() => onHourChange(h.hour)}
                                style={{
                                    flex: 1,
                                    height: "50px",
                                    background: `linear-gradient(180deg, ${condition.color}cc, ${condition.color}66)`,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    border:
                                        selectedHour === h.hour
                                            ? "2px solid #1a365d"
                                            : "2px solid transparent",
                                    position: "relative",
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: "9px",
                                        fontWeight: 600,
                                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    {h.hour}h
                                </Text>
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    {Math.round(pointData.speed)}
                                </Text>
                                {isCurrentHour && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "-6px",
                                            width: "6px",
                                            height: "6px",
                                            borderRadius: "50%",
                                            background: "#1a365d",
                                            border: "2px solid #fff",
                                        }}
                                    />
                                )}
                                {/* Top indicators (rain and wind change) */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-16px",
                                        display: "flex",
                                        gap: "2px",
                                        fontSize: "10px",
                                    }}
                                >
                                    {hasRain && <span>🌧️</span>}
                                    {isWindChange && <span>🔄</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div
                    style={{
                        marginTop: "8px",
                        display: "flex",
                        justifyContent: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    {isActuallyToday && (
                        <Text style={{ fontSize: "10px", color: "#4a6fa5" }}>
                            <span
                                style={{
                                    display: "inline-block",
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "#1a365d",
                                    verticalAlign: "middle",
                                    marginRight: "4px",
                                }}
                            />
                            Agora
                        </Text>
                    )}
                    <Text style={{ fontSize: "10px", color: "#4a6fa5" }}>
                        🌧️ Chuva
                    </Text>
                    <Text style={{ fontSize: "10px", color: "#4a6fa5" }}>
                        🔄 Mudança do Vento
                    </Text>
                </div>
            </div>

            {/* Points container with arrows */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <PointDisplay point={pointA} currentData={dataA} />
                <ArrowConnector />
                <PointDisplay point={pointB} currentData={dataB} />
                <ArrowConnector />
                <PointDisplay point={pointC} currentData={dataC} />
            </div>

            {/* Legend */}
            <div
                style={{
                    marginTop: "24px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#52c41a",
                        }}
                    />
                    <Text style={{ fontSize: "10px", color: "#1a365d" }}>Calmo (&lt;10 km/h)</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#faad14",
                        }}
                    />
                    <Text style={{ fontSize: "10px", color: "#1a365d" }}>Moderado (10-15 km/h)</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: "#ff4d4f",
                        }}
                    />
                    <Text style={{ fontSize: "10px", color: "#1a365d" }}>Perigoso (&gt;15 km/h)</Text>
                </div>
            </div>
        </div>
    );
}
