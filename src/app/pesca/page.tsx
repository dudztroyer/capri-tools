"use client";
import React, { useState, useMemo } from "react";
import { Row, Col, Spin, Alert, Typography } from "antd";
import { useFishingForecast } from "@/hooks/useFishingForecast";
import TodayDetailedView from "@/components/pesca/TodayDetailedView";
import ForecastDayCard from "@/components/pesca/ForecastDayCard";
import OpenMeteoDebug from "@/components/pesca/OpenMeteoDebug";

const { Text, Title } = Typography;

const FORECAST_DAYS = 14;

export default function PescaPage() {
    const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

    const { data, isLoading, error } = useFishingForecast(FORECAST_DAYS);

    // Get the selected forecast
    const selectedForecast = useMemo(() => {
        if (!data?.forecasts || !data.forecasts[selectedDayIndex]) {
            return null;
        }
        return data.forecasts[selectedDayIndex];
    }, [data, selectedDayIndex]);

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
                <Text type="secondary">Carregando previsão de pesca...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                title="Erro ao carregar dados"
                description="Não foi possível obter a previsão do tempo. Por favor, tente novamente mais tarde."
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
            {/* Intro */}
            <div
                style={{
                    marginBottom: "24px",
                    padding: "20px",
                    background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)",
                    borderRadius: "16px",
                    border: "1px solid #d6e8fa",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "28px" }}>🎣</span>
                    <Title level={4} style={{ margin: 0, color: "#1a365d" }}>
                        Possibilidade de Pesca
                    </Title>
                </div>
                <Text style={{ color: "#4a6fa5" }}>
                    Análise das condições climáticas para pesca baseada em 3 pontos: Capri → Ilhas → Mar Aberto.
                    Previsão para os próximos {FORECAST_DAYS} dias. Condições ideais: manhã calma, vento até 15 km/h, sem chuva.
                </Text>
            </div>

            {/* Two-column layout */}
            <Row gutter={[24, 24]}>
                {/* Left column - Selected day detailed view */}
                <Col xs={24} lg={14} xl={15}>
                    {selectedForecast && (
                        <TodayDetailedView forecast={selectedForecast} />
                    )}
                </Col>

                {/* Right column - Forecast cards */}
                <Col xs={24} lg={10} xl={9}>
                    {/* Forecast header */}
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "16px 20px",
                            background: "linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%)",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(26, 54, 93, 0.3)",
                        }}
                    >
                        <Text
                            style={{
                                color: "#fff",
                                fontSize: "16px",
                                fontWeight: 600,
                                display: "block",
                            }}
                        >
                            📅 Próximos {FORECAST_DAYS} Dias
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                            Clique em um dia para ver detalhes
                        </Text>
                    </div>

                    {/* Forecast cards list with scroll */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            overflowY: "auto",
                        }}
                    >
                        {data.forecasts.map((forecast, index) => (
                            <ForecastDayCard
                                key={index}
                                forecast={forecast}
                                isSelected={selectedDayIndex === index}
                                onClick={() => setSelectedDayIndex(index)}
                            />
                        ))}
                    </div>

                    {/* Info footer */}
                    <div
                        style={{
                            marginTop: "16px",
                            padding: "12px",
                            background: "#f5f5f5",
                            borderRadius: "12px",
                            textAlign: "center",
                        }}
                    >
                        <Text style={{ color: "#666", fontSize: "11px" }}>
                            Última atualização: {new Date(data.generatedAt).toLocaleTimeString("pt-BR")}
                        </Text>
                    </div>
                </Col>
            </Row>

            {/* Debug component for Open-Meteo API */}
            <OpenMeteoDebug />
        </div>
    );
}
