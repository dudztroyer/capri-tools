"use client";
import React, { useMemo, useState } from "react";
import { Row, Col, Spin, Alert, Empty, Typography, Card, Grid, Collapse } from "antd";
import { CompassOutlined, RadarChartOutlined } from "@ant-design/icons";
import { useNavios } from "@/hooks/useNavios";
import ShipCard from "@/components/navios/ShipCard";
import ShipStats from "@/components/navios/ShipStats";
import ShipFilters, { ShipFiltersState } from "@/components/navios/ShipFilters";
import { Ship, calculateAnchorTime } from "@/services/shipService";

const { useBreakpoint } = Grid;
const { Text } = Typography;

// VesselFinder URL Builder
interface VesselFinderParams {
    latitude: number;
    longitude: number;
    zoom: number;
    width?: string | number;
    height?: number;
    showNames?: boolean;
    showTrack?: boolean;
    clickToActivate?: boolean;
    storePosition?: boolean;
    mmsi?: number;
    imo?: number;
    defaultMapType?: string;
}

const buildVesselFinderUrl = ({
    latitude,
    longitude,
    zoom,
    width = "100%",
    height = 450,
    showNames = false,
    showTrack = false,
    clickToActivate = false,
    storePosition = false,
    mmsi,
    imo,
    defaultMapType,
}: VesselFinderParams): string => {
    const params = new URLSearchParams();

    params.set("zoom", String(zoom));
    params.set("lat", String(latitude));
    params.set("lon", String(longitude));
    params.set("width", String(width));
    params.set("height", String(height));
    params.set("names", String(showNames));
    params.set("track", String(showTrack));
    params.set("clicktoact", String(clickToActivate));
    params.set("store_pos", String(storePosition));
    params.set("fleet", "false");
    params.set("fleet_name", "false");
    params.set("fleet_hide_old_positions", "false");

    if (mmsi !== undefined) params.set("mmsi", String(mmsi));
    if (imo !== undefined) params.set("imo", String(imo));
    if (defaultMapType !== undefined) params.set("default_maptype", defaultMapType);

    return `https://www.vesselfinder.com/aismap?${params.toString()}`;
};

interface MarineTrafficParams {
    centerX: number;
    centerY: number;
    zoom: number;
    showNames?: boolean;
    mapType?: 0 | 1 | 4; // 0 = normal, 1 = satellite, 4 = dark
}

const buildMarineTrafficUrl = ({
    centerX,
    centerY,
    zoom,
    showNames = true,
    mapType,
}: MarineTrafficParams): string => {
    let url = `https://www.marinetraffic.com/en/ais/embed/centerx:${centerX}/centery:${centerY}/zoom:${zoom}/shownames:${showNames}`;

    if (mapType !== undefined) {
        url += `/maptype:${mapType}`;
    }


    return url + "/";
};

export default function NaviosPage() {
    const { data, isLoading, error } = useNavios();
    const screens = useBreakpoint();

    // Ant Design breakpoints: xs (<576), sm (≥576), md (≥768), lg (≥992), xl (≥1200), xxl (≥1600)
    const isMobile = !screens.md;

    const marineTrafficUrl = useMemo(
        () =>
            buildMarineTrafficUrl({
                centerX: -48.383,
                centerY: -26.168,
                zoom: isMobile ? 10 : 11,
                showNames: false,
            }),
        [isMobile]
    );

    const vesselFinderUrl = useMemo(
        () =>
            buildVesselFinderUrl({
                latitude: -26.168,
                longitude: -48.383,
                zoom: isMobile ? 10 : 11,
                height: 450,
                showNames: false,
            }),
        [isMobile]
    );

    const [filters, setFilters] = useState<ShipFiltersState>({
        search: "",
        type: "all",
        status: "all",
        sortBy: "arrival",
    });

    // Extract ships for stable dependency tracking
    const ships = data?.ships;

    // Filter and sort ships based on current filters
    const filteredShips = useMemo(() => {
        if (!ships) return [];

        let result = [...ships];

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(
                (ship) =>
                    ship.name.toLowerCase().includes(searchLower) ||
                    ship.imo.includes(filters.search)
            );
        }

        // Apply type filter
        if (filters.type !== "all") {
            result = result.filter((ship) => ship.type === filters.type);
        }

        // Apply status filter
        if (filters.status !== "all") {
            result = result.filter((ship) => ship.status === filters.status);
        }

        // Apply sorting
        result.sort((a: Ship, b: Ship) => {
            switch (filters.sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "size":
                    return b.grossTonnage - a.grossTonnage;
                case "arrival":
                default:
                    // Most recent first
                    return (
                        calculateAnchorTime(a.arrivalDate).totalHours -
                        calculateAnchorTime(b.arrivalDate).totalHours
                    );
            }
        });

        return result;
    }, [ships, filters]);

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                    gap: "16px",
                }}
            >
                <Spin size="large" />
                <Text type="secondary">Carregando dados dos navios...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                title="Erro ao carregar dados"
                description="Não foi possível obter os dados dos navios. Por favor, tente novamente mais tarde."
                type="error"
                showIcon
                style={{ marginTop: "24px" }}
            />
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div style={{ marginTop: "24px" }}>
            {/* Ship Tracking Maps Accordion */}
            <Card
                title={
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CompassOutlined style={{ color: "#1890ff" }} />
                        Mapa de Tráfego Marítimo - Baía da Babitonga
                    </span>
                }
                style={{ marginBottom: 24 }}
                styles={{
                    body: { padding: 0, overflow: "hidden" },
                }}
            >
                <Collapse
                    defaultActiveKey={["vesselfinder"]}
                    accordion
                    items={[
                        {
                            key: "vesselfinder",
                            label: (
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <RadarChartOutlined style={{ color: "#52c41a" }} />
                                    VesselFinder
                                </span>
                            ),
                            children: (
                                <iframe
                                    src={vesselFinderUrl}
                                    width="100%"
                                    height="450"
                                    style={{
                                        border: "none",
                                        display: "block",
                                    }}
                                    title="VesselFinder - Baía da Babitonga"
                                    loading="lazy"
                                    allowFullScreen
                                />
                            ),
                        },
                        {
                            key: "marinetraffic",
                            label: (
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <CompassOutlined style={{ color: "#1890ff" }} />
                                    Marine Traffic
                                </span>
                            ),
                            children: (
                                <iframe
                                    src={marineTrafficUrl}
                                    width="100%"
                                    height="450"
                                    style={{
                                        border: "none",
                                        display: "block",
                                    }}
                                    title="Marine Traffic - Baía da Babitonga"
                                    loading="lazy"
                                    allowFullScreen
                                />
                            ),
                        },
                    ]}
                />
            </Card>

            {/* Statistics overview */}
            <ShipStats ships={data.ships} lastUpdated={data.lastUpdated} />

            {/* Filters */}
            <ShipFilters
                filters={filters}
                onFiltersChange={setFilters}
                totalCount={data.ships.length}
                filteredCount={filteredShips.length}
            />

            {/* Ship cards grid */}
            {filteredShips.length === 0 ? (
                <Empty
                    description="Nenhum navio encontrado com os filtros selecionados"
                    style={{ marginTop: "48px" }}
                />
            ) : (
                <Row gutter={[20, 20]}>
                    {filteredShips.map((ship) => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={ship.id}>
                            <ShipCard ship={ship} />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}
