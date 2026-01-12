"use client";
import React from "react";
import { Card, Statistic, Row, Col, Typography } from "antd";
import {
    Ship,
    ShipStatus,
    ShipType,
    shipTypeLabels,
    calculateAnchorTime,
} from "@/services/shipService";

const { Text } = Typography;

interface ShipStatsProps {
    ships: Ship[];
    lastUpdated: string;
}

export default function ShipStats({ ships, lastUpdated }: ShipStatsProps) {
    // Calculate statistics
    const totalShips = ships.length;

    // Count by status
    const statusCounts = ships.reduce((acc, ship) => {
        acc[ship.status] = (acc[ship.status] || 0) + 1;
        return acc;
    }, {} as Record<ShipStatus, number>);

    // Count by type
    const typeCounts = ships.reduce((acc, ship) => {
        acc[ship.type] = (acc[ship.type] || 0) + 1;
        return acc;
    }, {} as Record<ShipType, number>);

    // Find the most common type
    const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

    // Calculate average anchor time
    const avgAnchorHours = ships.length > 0
        ? ships.reduce((sum, ship) => sum + calculateAnchorTime(ship.arrivalDate).totalHours, 0) / ships.length
        : 0;

    const avgDays = Math.floor(avgAnchorHours / 24);
    const avgHours = Math.floor(avgAnchorHours % 24);

    // Find longest waiting ship
    const longestWaiting = ships.reduce((longest, ship) => {
        const current = calculateAnchorTime(ship.arrivalDate).totalHours;
        const longestTime = longest ? calculateAnchorTime(longest.arrivalDate).totalHours : 0;
        return current > longestTime ? ship : longest;
    }, null as Ship | null);

    const longestTime = longestWaiting ? calculateAnchorTime(longestWaiting.arrivalDate) : null;

    return (
        <Card
            style={{
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                marginBottom: "24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
            styles={{
                body: { padding: "24px" },
            }}
        >
            <Row gutter={[24, 24]}>
                <Col xs={12} sm={6}>
                    <Statistic
                        title={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Total de Navios</Text>}
                        value={totalShips}
                        styles={{ content: { color: "#fff", fontSize: "32px", fontWeight: 700 } }}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic
                        title={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Fundeados</Text>}
                        value={statusCounts.anchored || 0}
                        styles={{ content: { color: "#fff", fontSize: "32px", fontWeight: 700 } }}
                        suffix={<span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)" }}>⚓</span>}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic
                        title={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Aguardando Berço</Text>}
                        value={statusCounts.waiting_berth || 0}
                        styles={{ content: { color: "#fff", fontSize: "32px", fontWeight: 700 } }}
                        suffix={<span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)" }}>🕐</span>}
                    />
                </Col>
                <Col xs={12} sm={6}>
                    <Statistic
                        title={<Text style={{ color: "rgba(255,255,255,0.8)" }}>Tempo Médio</Text>}
                        value={avgDays > 0 ? `${avgDays}d ${avgHours}h` : `${avgHours}h`}
                        styles={{ content: { color: "#fff", fontSize: "28px", fontWeight: 700 } }}
                    />
                </Col>
            </Row>

            <div
                style={{
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                }}
            >
                {mostCommonType && (
                    <div>
                        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                            Tipo mais comum
                        </Text>
                        <div>
                            <Text style={{ color: "#fff", fontWeight: 500 }}>
                                {shipTypeLabels[mostCommonType[0] as ShipType]} ({mostCommonType[1]})
                            </Text>
                        </div>
                    </div>
                )}
                {longestWaiting && longestTime && (
                    <div>
                        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                            Maior tempo de espera
                        </Text>
                        <div>
                            <Text style={{ color: "#fff", fontWeight: 500 }}>
                                {longestWaiting.name} ({longestTime.days}d {longestTime.hours}h)
                            </Text>
                        </div>
                    </div>
                )}
                <div>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                        Última atualização
                    </Text>
                    <div>
                        <Text style={{ color: "#fff", fontWeight: 500 }}>
                            {new Date(lastUpdated).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </Text>
                    </div>
                </div>
            </div>
        </Card>
    );
}
