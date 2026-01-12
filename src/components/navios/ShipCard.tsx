"use client";
import { Card, Tag, Typography, Space, Tooltip, Row, Col, Progress } from "antd";
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    ArrowRightOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import {
    Ship,
    shipTypeLabels,
    shipStatusLabels,
    shipStatusColors,
    shipTypeIcons,
    formatAnchorTime,
    calculateAnchorTime,
} from "@/services/shipService";

const { Text, Title } = Typography;

interface ShipCardProps {
    ship: Ship;
}

export default function ShipCard({ ship }: ShipCardProps) {
    const anchorTime = calculateAnchorTime(ship.arrivalDate);
    const formattedTime = formatAnchorTime(ship.arrivalDate);

    // Calculate progress bar percentage (max 7 days = 100%)
    const progressPercent = Math.min((anchorTime.totalHours / (7 * 24)) * 100, 100);

    // Determine progress color based on time
    const getProgressColor = () => {
        if (anchorTime.days >= 5) return "#ff4d4f"; // Red for 5+ days
        if (anchorTime.days >= 3) return "#faad14"; // Orange for 3-4 days
        if (anchorTime.days >= 1) return "#1890ff"; // Blue for 1-2 days
        return "#52c41a"; // Green for less than 1 day
    };

    return (
        <Card
            hoverable
            style={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid #f0f0f0",
                height: "100%",
            }}
            styles={{
                body: { padding: "20px" },
            }}
        >
            {/* Header with ship name and type icon */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            fontSize: "32px",
                            width: "50px",
                            height: "50px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f6f8fa",
                            borderRadius: "10px",
                        }}
                    >
                        {shipTypeIcons[ship.type]}
                    </div>
                    <div>
                        <Title level={5} style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                            {ship.name}
                        </Title>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            IMO: {ship.imo}
                        </Text>
                    </div>
                </div>
                <Tag color={shipStatusColors[ship.status]} style={{ margin: 0 }}>
                    {shipStatusLabels[ship.status]}
                </Tag>
            </div>

            {/* Time anchored with progress bar */}
            <div
                style={{
                    backgroundColor: "#fafafa",
                    borderRadius: "8px",
                    padding: "12px",
                    marginBottom: "16px",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <Space size={4}>
                        <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            Tempo na baía
                        </Text>
                    </Space>
                    <Text strong style={{ fontSize: "16px", color: getProgressColor() }}>
                        {formattedTime}
                    </Text>
                </div>
                <Progress
                    percent={progressPercent}
                    size="small"
                    showInfo={false}
                    strokeColor={getProgressColor()}
                    railColor="#e8e8e8"
                />
            </div>

            {/* Ship details grid */}
            <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
                <Col span={12}>
                    <div>
                        <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                            Tipo
                        </Text>
                        <Text style={{ fontSize: "13px" }}>{shipTypeLabels[ship.type]}</Text>
                    </div>
                </Col>
                <Col span={12}>
                    <div>
                        <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                            Bandeira
                        </Text>
                        <Text style={{ fontSize: "13px" }}>{ship.flagName}</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <div>
                        <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                            Comprimento
                        </Text>
                        <Text style={{ fontSize: "13px" }}>{ship.length}m</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <div>
                        <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                            Boca
                        </Text>
                        <Text style={{ fontSize: "13px" }}>{ship.beam}m</Text>
                    </div>
                </Col>
                <Col span={8}>
                    <div>
                        <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                            Calado
                        </Text>
                        <Text style={{ fontSize: "13px" }}>{ship.draft}m</Text>
                    </div>
                </Col>
            </Row>

            {/* Route info */}
            {(ship.origin || ship.destination) && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px",
                        backgroundColor: "#f0f7ff",
                        borderRadius: "8px",
                        marginBottom: "12px",
                    }}
                >
                    <EnvironmentOutlined style={{ color: "#1890ff" }} />
                    <Text style={{ fontSize: "12px" }}>
                        {ship.origin}
                        {ship.origin && ship.destination && (
                            <ArrowRightOutlined style={{ margin: "0 8px", fontSize: "10px", color: "#8c8c8c" }} />
                        )}
                        {ship.destination}
                    </Text>
                </div>
            )}

            {/* Cargo and agent */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {ship.cargo && (
                    <Tooltip title="Carga">
                        <Tag
                            icon={<InfoCircleOutlined />}
                            style={{
                                backgroundColor: "#f9f9f9",
                                border: "1px solid #e8e8e8",
                                color: "#595959",
                            }}
                        >
                            {ship.cargo.length > 20 ? `${ship.cargo.substring(0, 20)}...` : ship.cargo}
                        </Tag>
                    </Tooltip>
                )}
                {ship.agent && (
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        Agente: {ship.agent}
                    </Text>
                )}
            </div>
        </Card>
    );
}
