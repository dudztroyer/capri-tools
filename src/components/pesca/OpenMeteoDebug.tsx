"use client";
import React, { useState, useMemo } from "react";
import { Card, Typography, Spin, Alert, Button, Collapse, Select, Table } from "antd";
import { ReloadOutlined, CodeOutlined, TableOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useOpenMeteoRaw, useOpenMeteo } from "@/hooks/useOpenMeteo";
import type { WeatherPoint } from "@/services/openMeteoService";
import { FISHING_POINTS } from "@/services/openMeteoService";
import JsonViewer from "./JsonViewer";
import { getVentuskyUrl, getGoogleMapsRouteUrl, calculateDistanceKm } from "./mapUrls";

const { Text, Title } = Typography;

// Convert wind direction degrees to arrow
function getWindArrow(degrees: number): string {
    // Wind direction is where wind comes FROM, arrow should point TO
    const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
    const index = Math.round(degrees / 45) % 8;
    return arrows[index];
}

// Hours to display (5:00 - 19:00)
const DISPLAY_HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

// Map component for visualizing coordinates
interface CoordinatesMapProps {
    requestedPoints: Array<{ id: string; name: string; lat: number; lng: number }>;
    returnedPoints: Array<{ id: string; name: string; lat: number; lng: number }>;
}

function CoordinatesMap({ requestedPoints, returnedPoints }: CoordinatesMapProps) {
    // Calculate bounds for all points
    const allPoints = [...requestedPoints, ...returnedPoints];
    if (allPoints.length === 0) return null;

    const lats = allPoints.map(p => p.lat);
    const lngs = allPoints.map(p => p.lng);

    const minLat = Math.min(...lats) - 0.02;
    const maxLat = Math.max(...lats) + 0.02;
    const minLng = Math.min(...lngs) - 0.02;
    const maxLng = Math.max(...lngs) + 0.02;

    const width = 500;
    const height = 350;
    const padding = 40;

    // Convert lat/lng to SVG coordinates
    const toSvgX = (lng: number) => padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
    const toSvgY = (lat: number) => height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);

    const colors = {
        A: { requested: "#1890ff", returned: "#40a9ff" },
        B: { requested: "#52c41a", returned: "#73d13d" },
        C: { requested: "#fa8c16", returned: "#ffa940" },
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <svg
                width={width}
                height={height}
                style={{
                    background: "linear-gradient(180deg, #e8f4fd 0%, #c5e3f6 100%)",
                    borderRadius: "12px",
                    border: "1px solid #d9d9d9",
                }}
            >
                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((ratio) => (
                    <React.Fragment key={ratio}>
                        <line
                            x1={padding}
                            y1={padding + ratio * (height - 2 * padding)}
                            x2={width - padding}
                            y2={padding + ratio * (height - 2 * padding)}
                            stroke="#ffffff"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                        <line
                            x1={padding + ratio * (width - 2 * padding)}
                            y1={padding}
                            x2={padding + ratio * (width - 2 * padding)}
                            y2={height - padding}
                            stroke="#ffffff"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                    </React.Fragment>
                ))}

                {/* Axis labels */}
                <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#666">
                    Longitude (°)
                </text>
                <text x={12} y={height / 2} textAnchor="middle" fontSize="10" fill="#666" transform={`rotate(-90, 12, ${height / 2})`}>
                    Latitude (°)
                </text>

                {/* Corner coordinates */}
                <text x={padding} y={height - padding + 15} textAnchor="middle" fontSize="9" fill="#888">
                    {minLng.toFixed(3)}
                </text>
                <text x={width - padding} y={height - padding + 15} textAnchor="middle" fontSize="9" fill="#888">
                    {maxLng.toFixed(3)}
                </text>
                <text x={padding - 5} y={padding} textAnchor="end" fontSize="9" fill="#888">
                    {maxLat.toFixed(3)}
                </text>
                <text x={padding - 5} y={height - padding} textAnchor="end" fontSize="9" fill="#888">
                    {minLat.toFixed(3)}
                </text>

                {/* Connection lines between requested and returned */}
                {requestedPoints.map((req) => {
                    const ret = returnedPoints.find(r => r.id === req.id);
                    if (!ret) return null;
                    return (
                        <line
                            key={`line-${req.id}`}
                            x1={toSvgX(req.lng)}
                            y1={toSvgY(req.lat)}
                            x2={toSvgX(ret.lng)}
                            y2={toSvgY(ret.lat)}
                            stroke="#666"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            opacity="0.6"
                        />
                    );
                })}

                {/* Requested points (circles with A, B, C) */}
                {requestedPoints.map((point) => {
                    const color = colors[point.id as keyof typeof colors]?.requested || "#1890ff";
                    const x = toSvgX(point.lng);
                    const y = toSvgY(point.lat);
                    return (
                        <g key={`req-${point.id}`}>
                            <circle
                                cx={x}
                                cy={y}
                                r="12"
                                fill={color}
                                stroke="#fff"
                                strokeWidth="2"
                                opacity="0.9"
                            />
                            <text
                                x={x}
                                y={y + 4}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#fff"
                                fontWeight="bold"
                            >
                                {point.id}
                            </text>
                            {/* Label above */}
                            <text
                                x={x}
                                y={y - 18}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#1a365d"
                                fontWeight="600"
                            >
                                {point.name}
                            </text>
                        </g>
                    );
                })}

                {/* Returned points (squares with A', B', C') */}
                {returnedPoints.map((point) => {
                    const color = colors[point.id as keyof typeof colors]?.returned || "#40a9ff";
                    const x = toSvgX(point.lng);
                    const y = toSvgY(point.lat);
                    const size = 10;
                    return (
                        <g key={`ret-${point.id}`}>
                            <rect
                                x={x - size}
                                y={y - size}
                                width={size * 2}
                                height={size * 2}
                                fill={color}
                                stroke="#fff"
                                strokeWidth="2"
                                opacity="0.9"
                            />
                            <text
                                x={x}
                                y={y + 4}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#fff"
                                fontWeight="bold"
                            >
                                {point.id}&apos;
                            </text>
                            {/* Label below */}
                            <text
                                x={x}
                                y={y + size + 14}
                                textAnchor="middle"
                                fontSize="9"
                                fill="#666"
                            >
                                ({point.lat.toFixed(2)}, {point.lng.toFixed(2)})
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="24" height="24">
                        <circle cx="12" cy="12" r="10" fill="#1890ff" stroke="#fff" strokeWidth="2" />
                        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">A</text>
                    </svg>
                    <Text style={{ fontSize: "12px" }}>Solicitado (A, B, C)</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="24" height="24">
                        <rect x="2" y="2" width="20" height="20" fill="#40a9ff" stroke="#fff" strokeWidth="2" />
                        <text x="12" y="16" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">A&apos;</text>
                    </svg>
                    <Text style={{ fontSize: "12px" }}>Retornado (A&apos;, B&apos;, C&apos;)</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="24" height="20">
                        <line x1="2" y1="10" x2="22" y2="10" stroke="#666" strokeWidth="1" strokeDasharray="4,4" />
                    </svg>
                    <Text style={{ fontSize: "12px" }}>A → A&apos;</Text>
                </div>
            </div>

            {/* Distances between requested and returned */}
            <div style={{
                background: "#f5f5f5",
                borderRadius: "8px",
                padding: "12px 16px",
                width: "100%",
                maxWidth: "500px",
            }}>
                <Text strong style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}>
                    📏 Distância entre Solicitado e Retornado:
                </Text>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {requestedPoints.map((req) => {
                        const ret = returnedPoints.find(r => r.id === req.id);
                        if (!ret) return null;
                        const distance = calculateDistanceKm(req.lat, req.lng, ret.lat, ret.lng);
                        const isSameCell = distance < 0.1;
                        const ventuskyReq = getVentuskyUrl(req.lat, req.lng);
                        const ventuskyRet = getVentuskyUrl(ret.lat, ret.lng);
                        return (
                            <div
                                key={req.id}
                                style={{
                                    background: "#fff",
                                    borderRadius: "6px",
                                    padding: "8px 12px",
                                    border: "1px solid #e8e8e8",
                                }}
                            >
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "6px",
                                }}>
                                    <Text style={{ fontSize: "12px" }}>
                                        <strong>{req.id}</strong> ({req.name}) → <strong>{req.id}&apos;</strong>
                                    </Text>
                                    <Text style={{
                                        color: isSameCell ? "#52c41a" : distance > 5 ? "#ff4d4f" : "#faad14",
                                        fontWeight: 600,
                                        fontSize: "12px",
                                    }}>
                                        {distance.toFixed(2)} km
                                        {isSameCell && " ✓"}
                                    </Text>
                                </div>
                                <div style={{
                                    display: "flex",
                                    gap: "12px",
                                    fontSize: "11px",
                                }}>
                                    <a
                                        href={ventuskyReq}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#1890ff", textDecoration: "none" }}
                                    >
                                        🔗 {req.id} Ventusky
                                    </a>
                                    <a
                                        href={ventuskyRet}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: "#40a9ff", textDecoration: "none" }}
                                    >
                                        🔗 {req.id}&apos; Ventusky
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Text style={{ fontSize: "10px", color: "#888", display: "block", marginTop: "8px" }}>
                    ⚠️ Resolução do modelo ~11km. Pontos mais próximos podem retornar a mesma célula.
                </Text>

                {/* Google Maps links */}
                <div style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #e8e8e8",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}>
                    <Text strong style={{ fontSize: "11px" }}>🗺️ Ver todos os pontos no Google Maps:</Text>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <a
                            href={getGoogleMapsRouteUrl(requestedPoints)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#1890ff",
                                textDecoration: "none",
                                fontSize: "11px",
                                background: "#e6f7ff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                            }}
                        >
                            📍 Pontos Solicitados (A, B, C)
                        </a>
                        <a
                            href={getGoogleMapsRouteUrl(returnedPoints)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#40a9ff",
                                textDecoration: "none",
                                fontSize: "11px",
                                background: "#f0f5ff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                            }}
                        >
                            📍 Pontos Retornados (A&apos;, B&apos;, C&apos;)
                        </a>
                        <a
                            href={getGoogleMapsRouteUrl([...requestedPoints, ...returnedPoints])}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#722ed1",
                                textDecoration: "none",
                                fontSize: "11px",
                                background: "#f9f0ff",
                                padding: "4px 8px",
                                borderRadius: "4px",
                            }}
                        >
                            📍 Todos os Pontos
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OpenMeteoDebug() {
    const [showRaw, setShowRaw] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>("");
    const [selectedLocation, setSelectedLocation] = useState<number>(0);

    const { data: rawData, isLoading: rawLoading, error: rawError, refetch: refetchRaw } = useOpenMeteoRaw(16);
    const { data: parsedData, isLoading: parsedLoading, error: parsedError, refetch: refetchParsed } = useOpenMeteo(16);

    const isLoading = rawLoading || parsedLoading;
    const error = rawError || parsedError;

    const handleRefetch = () => {
        refetchRaw();
        refetchParsed();
    };

    // Get available days from the data
    const availableDays = useMemo(() => {
        if (!parsedData?.locations[0]?.data) return [];
        const days = new Set<string>();
        parsedData.locations[0].data.forEach((point) => {
            // Handle both Date objects and ISO strings (from cache serialization)
            const timestamp = point.timestamp instanceof Date
                ? point.timestamp
                : new Date(point.timestamp);
            const dateStr = timestamp.toISOString().split("T")[0];
            days.add(dateStr);
        });
        return Array.from(days).sort();
    }, [parsedData]);

    // Derive effective selected day (fall back to first available day)
    const effectiveSelectedDay = selectedDay || availableDays[0] || "";

    // Filter data for selected day and hours (5-19)
    const filteredDataByHour = useMemo(() => {
        if (!parsedData || !effectiveSelectedDay) return new Map<number, WeatherPoint>();
        const location = parsedData.locations[selectedLocation];
        if (!location) return new Map<number, WeatherPoint>();

        const hourMap = new Map<number, WeatherPoint>();
        location.data.forEach((point) => {
            // Handle both Date objects and ISO strings (from cache serialization)
            const timestamp = point.timestamp instanceof Date
                ? point.timestamp
                : new Date(point.timestamp);
            const dateStr = timestamp.toISOString().split("T")[0];
            const hour = timestamp.getHours();
            if (dateStr === effectiveSelectedDay && DISPLAY_HOURS.includes(hour)) {
                hourMap.set(hour, point);
            }
        });
        return hourMap;
    }, [parsedData, effectiveSelectedDay, selectedLocation]);

    // Build table data source
    const tableDataSource = useMemo(() => {
        const rows = [
            {
                key: "temperature",
                metric: "🌡️ Temperatura (°C)",
                ...Object.fromEntries(
                    DISPLAY_HOURS.map((h) => [
                        `h${h}`,
                        filteredDataByHour.get(h)?.temperature?.toFixed(1) ?? "-",
                    ])
                ),
            },
            {
                key: "wind",
                metric: "💨 Vento (km/h)",
                ...Object.fromEntries(
                    DISPLAY_HOURS.map((h) => {
                        const point = filteredDataByHour.get(h);
                        if (!point) return [`h${h}`, "-"];
                        const arrow = getWindArrow(point.windDirection);
                        return [`h${h}`, `${point.windDirection}° ${arrow} ${point.windSpeed.toFixed(0)}`];
                    })
                ),
            },
            {
                key: "windGusts",
                metric: "🌪️ Rajadas (km/h)",
                ...Object.fromEntries(
                    DISPLAY_HOURS.map((h) => [
                        `h${h}`,
                        filteredDataByHour.get(h)?.windGusts?.toFixed(0) ?? "-",
                    ])
                ),
            },
            {
                key: "rain",
                metric: "🌧️ Chuva (mm)",
                ...Object.fromEntries(
                    DISPLAY_HOURS.map((h) => [
                        `h${h}`,
                        filteredDataByHour.get(h)?.rain?.toFixed(1) ?? "-",
                    ])
                ),
            },
            {
                key: "precipitation",
                metric: "💧 Precipitação (mm)",
                ...Object.fromEntries(
                    DISPLAY_HOURS.map((h) => [
                        `h${h}`,
                        filteredDataByHour.get(h)?.precipitation?.toFixed(1) ?? "-",
                    ])
                ),
            },
            {
                key: "precipitationProb",
                metric: "☔ Prob. Chuva (%)",
                ...Object.fromEntries(
                    DISPLAY_HOURS.map((h) => [
                        `h${h}`,
                        filteredDataByHour.get(h)?.precipitationProbability?.toFixed(0) ?? "-",
                    ])
                ),
            },
            {
                key: "showers",
                metric: "🌦️ Pancadas (mm)",
                ...Object.fromEntries(
                    DISPLAY_HOURS.map((h) => [
                        `h${h}`,
                        filteredDataByHour.get(h)?.showers?.toFixed(1) ?? "-",
                    ])
                ),
            },
        ];
        return rows;
    }, [filteredDataByHour]);

    // Table columns
    const tableColumns = [
        {
            title: "Métrica",
            dataIndex: "metric",
            key: "metric",
            fixed: "left" as const,
            width: 150,
        },
        ...DISPLAY_HOURS.map((h) => ({
            title: `${h}:00`,
            dataIndex: `h${h}`,
            key: `h${h}`,
            width: 90,
            align: "center" as const,
        })),
    ];

    return (
        <Card
            style={{
                marginTop: "24px",
                borderRadius: "12px",
                border: "1px dashed #d9d9d9",
                background: "#fafafa",
            }}
            styles={{
                body: { padding: "16px" },
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CodeOutlined style={{ fontSize: "18px", color: "#1890ff" }} />
                    <Title level={5} style={{ margin: 0 }}>
                        Open-Meteo API Debug
                    </Title>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                        size="small"
                        onClick={() => setShowRaw(!showRaw)}
                        type={showRaw ? "primary" : "default"}
                    >
                        {showRaw ? "Parsed" : "Raw"}
                    </Button>
                    <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={handleRefetch}
                        loading={isLoading}
                    >
                        Refetch
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spin size="large" />
                    <Text style={{ display: "block", marginTop: "16px", color: "#666" }}>
                        Fetching weather data from Open-Meteo...
                    </Text>
                </div>
            )}

            {error && (
                <Alert
                    type="error"
                    title="Error fetching data"
                    description={error.message}
                    showIcon
                />
            )}

            {!isLoading && !error && (
                <Collapse
                    defaultActiveKey={["table"]}
                    items={[
                        {
                            key: "table",
                            label: (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <TableOutlined />
                                    <Text strong>📋 Tabela de Dados por Hora</Text>
                                </div>
                            ),
                            children: (
                                <div>
                                    <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <Text>Dia:</Text>
                                            <Select
                                                value={effectiveSelectedDay}
                                                onChange={setSelectedDay}
                                                style={{ width: 150 }}
                                                options={availableDays.map((day) => ({
                                                    value: day,
                                                    label: new Date(day + "T12:00:00").toLocaleDateString("pt-BR", {
                                                        weekday: "short",
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                    }),
                                                }))}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <Text>Local:</Text>
                                            <Select
                                                value={selectedLocation}
                                                onChange={setSelectedLocation}
                                                style={{ width: 150 }}
                                                options={parsedData?.locations.map((loc, idx) => ({
                                                    value: idx,
                                                    label: loc.locationName,
                                                })) ?? []}
                                            />
                                        </div>
                                    </div>
                                    <Table
                                        dataSource={tableDataSource}
                                        columns={tableColumns}
                                        pagination={false}
                                        size="small"
                                        bordered
                                        scroll={{ x: "max-content" }}
                                        style={{ fontSize: "12px" }}
                                    />
                                </div>
                            ),
                        },
                        {
                            key: "map",
                            label: (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <EnvironmentOutlined />
                                    <Text strong>🗺️ Mapa de Coordenadas</Text>
                                </div>
                            ),
                            children: (
                                <CoordinatesMap
                                    requestedPoints={Object.entries(FISHING_POINTS).map(([id, point]) => ({
                                        id,
                                        name: point.name,
                                        lat: point.coordinates.lat,
                                        lng: point.coordinates.lng,
                                    }))}
                                    returnedPoints={parsedData?.locations.map((loc) => ({
                                        id: loc.locationId,
                                        name: loc.locationName,
                                        lat: loc.latitude,
                                        lng: loc.longitude,
                                    })) ?? []}
                                />
                            ),
                        },
                        {
                            key: "info",
                            label: (
                                <Text strong>
                                    📊 Data Summary ({parsedData?.locations.length || 0} locations, {parsedData?.locations[0]?.data.length || 0} hourly points each)
                                </Text>
                            ),
                            children: (
                                <div style={{ fontSize: "12px", color: "#666" }}>
                                    <p><strong>Fetched at:</strong> {parsedData?.fetchedAt ? new Date(parsedData.fetchedAt).toLocaleString("pt-BR") : "-"}</p>
                                    <p><strong>Locations (Solicitado → Retornado pela API):</strong></p>
                                    <ul>
                                        {parsedData?.locations.map((loc) => {
                                            const pointDef = FISHING_POINTS[loc.locationId as keyof typeof FISHING_POINTS];
                                            const sameCell = loc.latitude.toFixed(4) === parsedData.locations.find(l => l.locationId !== loc.locationId)?.latitude.toFixed(4);
                                            return (
                                                <li key={loc.locationId} style={{ marginBottom: "8px" }}>
                                                    <strong>{loc.locationName}</strong>:
                                                    <br />
                                                    <span style={{ color: "#1890ff" }}>
                                                        Solicitado: {pointDef?.coordinates
                                                            ? `${pointDef.coordinates.lat.toFixed(6)}, ${pointDef.coordinates.lng.toFixed(6)}`
                                                            : "(limpe o cache do navegador)"}
                                                    </span>
                                                    <br />
                                                    <span style={{ color: sameCell ? "#ff4d4f" : "#52c41a" }}>
                                                        Retornado: {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                                                        {sameCell && " ⚠️ (mesma célula que outro local)"}
                                                    </span>
                                                    <br />
                                                    <span>({loc.data.length} data points)</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <p style={{ background: "#fff7e6", padding: "8px", borderRadius: "4px", border: "1px solid #ffd591" }}>
                                        <strong>⚠️ Nota:</strong> O modelo meteorológico do Open-Meteo tem resolução de ~11km.
                                        Pontos muito próximos podem cair na mesma célula e retornar dados idênticos.
                                    </p>
                                    <p><strong>Time range:</strong> {parsedData?.locations[0]?.data[0]?.timestamp ? new Date(parsedData.locations[0].data[0].timestamp).toLocaleString("pt-BR") : "-"} → {parsedData?.locations[0]?.data[parsedData.locations[0].data.length - 1]?.timestamp ? new Date(parsedData.locations[0].data[parsedData.locations[0].data.length - 1].timestamp).toLocaleString("pt-BR") : "-"}</p>
                                </div>
                            ),
                        },
                        {
                            key: "data",
                            label: (
                                <Text strong>
                                    🔍 {showRaw ? "Raw API Response" : "Parsed Data"} (JSON)
                                </Text>
                            ),
                            children: (
                                <JsonViewer
                                    data={showRaw ? rawData : parsedData}
                                    initialExpanded={true}
                                />
                            ),
                        },
                    ]}
                />
            )}
        </Card>
    );
}
