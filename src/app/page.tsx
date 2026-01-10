"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Row, Col, Card, Spin, Alert, Space, Tag, Typography, Divider, Button } from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useTideData } from "@/hooks/useTideData";
import { useLanchaPassa } from "@/hooks/useLanchaPassa";
import { useTideTableData } from "@/hooks/useTideTableData";
import { useTideChartData } from "@/hooks/useTideChartData";
import { useCurrentDayRange } from "@/hooks/useCurrentDayRange";
import ContinuousTideChart from "@/components/tide-table/ContinuousTideChart";

const { Title, Text } = Typography;
const HARBOR = "sc01";

export default function Home() {
  const router = useRouter();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  const { data: tideData, isLoading: isLoadingTide, error: tideError } = useTideData();
  const { data: lanchaData, isLoading: isLoadingLancha, error: lanchaError } = useLanchaPassa();
  const { data: tideTableData, isLoading: isLoadingTable, error: tableError } = useTideTableData(HARBOR, currentMonth);
  
  const [brushRange, setBrushRange] = useState<[number, number] | null>(null);
  
  const { chartData, continuousChartData } = useTideChartData(tideTableData);
  
  const { initialBrushRange, getNowRange, getTodayRange, getTomorrowRange, getPreviousDayRange, getNextDayRange } = useCurrentDayRange(
    continuousChartData,
    true, // isCurrentMonth
    currentDay
  );

  // Calculate next direction change time
  const nextDirectionChange = useMemo(() => {
    if (!tideData || !lanchaData?.currentDirection) return null;
    
    const now = new Date();
    const nextHigh = tideData.nextHigh ? new Date(tideData.nextHigh.timestamp) : null;
    const nextLow = tideData.nextLow ? new Date(tideData.nextLow.timestamp) : null;
    
    // If tide is rising, next change is at next high (will start falling)
    // If tide is falling, next change is at next low (will start rising)
    if (lanchaData.currentDirection === "up" && nextHigh) {
      return nextHigh;
    } else if (lanchaData.currentDirection === "down" && nextLow) {
      return nextLow;
    }
    
    // Fallback: return whichever is sooner
    if (nextHigh && nextLow) {
      return nextHigh < nextLow ? nextHigh : nextLow;
    }
    return nextHigh || nextLow;
  }, [tideData, lanchaData]);

  const formatDateTime = (date: Date | null): string => {
    if (!date) return "N/A";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToNow = () => {
    const nowRange = getNowRange();
    if (nowRange) {
      setBrushRange(nowRange);
    }
  };

  const goToToday = () => {
    const todayRange = getTodayRange();
    if (todayRange) {
      setBrushRange(todayRange);
    }
  };

  const goToTomorrow = () => {
    const tomorrowRange = getTomorrowRange();
    if (tomorrowRange) {
      setBrushRange(tomorrowRange);
    }
  };

  const goToPreviousDay = (baseDay: number) => {
    const previousDayRange = getPreviousDayRange(baseDay);
    if (previousDayRange) {
      setBrushRange(previousDayRange);
    }
  };

  const goToNextDay = (baseDay: number) => {
    const nextDayRange = getNextDayRange(baseDay);
    if (nextDayRange) {
      setBrushRange(nextDayRange);
    }
  };

  const isLoading = isLoadingTide || isLoadingLancha || isLoadingTable;
  const hasError = tideError || lanchaError || tableError;

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert
        message="Erro ao carregar dados"
        description="Não foi possível obter os dados. Por favor, tente novamente mais tarde."
        type="error"
        showIcon
        style={{ marginTop: "24px" }}
      />
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <Row gutter={[24, 24]}>
        {/* Maré Atual */}
        <Col xs={24} md={12}>
          <Card
            title="Maré Atual"
            extra={
              <Button 
                type="primary" 
                icon={<CalendarOutlined />}
                onClick={() => router.push("/tide-table")}
              >
                Ver Tábua
              </Button>
            }
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <Space orientation="vertical" size="large" style={{ width: "100%" }}>
              {tideData && (
                <>
                  <div>
                    <Title level={2} style={{ margin: 0 }}>
                      {tideData.current.height.toFixed(2)}m
                    </Title>
                    <Text type="secondary">Altura atual da maré</Text>
                  </div>
                  
                  <Divider />
                  
                  {lanchaData?.currentDirection && (
                    <div>
                      <Title level={5}>Direção da Maré</Title>
                      <Space>
                        <Tag 
                          color={lanchaData.currentDirection === "up" ? "success" : "warning"}
                          icon={lanchaData.currentDirection === "up" ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          style={{ fontSize: "16px", padding: "4px 12px" }}
                        >
                          {lanchaData.currentDirection === "up" ? "Subindo" : "Descendo"}
                        </Tag>
                      </Space>
                    </div>
                  )}
                  
                  {nextDirectionChange && (
                    <>
                      <Divider />
                      <div>
                        <Title level={5}>
                          <ClockCircleOutlined /> Próxima Mudança de Direção
                        </Title>
                        <Text strong style={{ fontSize: "16px" }}>
                          {formatDateTime(nextDirectionChange)}
                        </Text>
                        <br />
                        <Text type="secondary">
                          {lanchaData?.currentDirection === "up" 
                            ? "A maré começará a descer" 
                            : "A maré começará a subir"}
                        </Text>
                      </div>
                    </>
                  )}
                </>
              )}
            </Space>
          </Card>
        </Col>

        {/* Status do Barco */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <span>Status do Barco</span>
                {lanchaData?.isPassingNow ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Passando Agora
                  </Tag>
                ) : (
                  <Tag color="default" icon={<CloseCircleOutlined />}>
                    Não Está Passando
                  </Tag>
                )}
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<EyeOutlined />}
                onClick={() => router.push("/a-lancha-passa")}
              >
                Ver Janelas
              </Button>
            }
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <Space orientation="vertical" size="large" style={{ width: "100%" }}>
              {lanchaData?.isPassingNow ? (
                <Alert
                  message="O barco está passando agora!"
                  description={
                    lanchaData.currentWindowEnd
                      ? `Pode passar até ${formatDateTime(new Date(lanchaData.currentWindowEnd))}`
                      : "Condições ideais para passagem no momento."
                  }
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
              ) : (
                <Alert
                  message="O barco não está passando no momento"
                  description={
                    lanchaData?.nextPassage
                      ? `Próxima janela de passagem: ${formatDateTime(new Date(lanchaData.nextPassage))}`
                      : "Aguarde uma janela de passagem adequada."
                  }
                  type="info"
                  showIcon
                />
              )}
              
              {lanchaData?.currentWindowEnd && lanchaData.isPassingNow && (
                <>
                  <Divider />
                  <div>
                    <Title level={5}>Janela de Passagem Atual</Title>
                    <Text>
                      Válida até: <Text strong>{formatDateTime(new Date(lanchaData.currentWindowEnd))}</Text>
                    </Text>
                  </div>
                </>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Gráfico do Mês */}
      {continuousChartData.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <ContinuousTideChart
            data={continuousChartData}
            isCurrentMonth={true}
            brushRange={brushRange}
            initialBrushRange={initialBrushRange}
            onBrushChange={setBrushRange}
            onGoToNow={goToNow}
            onGoToToday={goToToday}
            onGoToTomorrow={goToTomorrow}
            onGoToPreviousDay={goToPreviousDay}
            onGoToNextDay={goToNextDay}
          />
        </div>
      )}
    </div>
  );
}
