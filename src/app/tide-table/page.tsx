"use client";
import React, { useState } from "react";
import { Spin, Alert } from "antd";
import { useTideTableData } from "@/hooks/useTideTableData";
import { useTideChartData } from "@/hooks/useTideChartData";
import { useCurrentDayRange } from "@/hooks/useCurrentDayRange";
import MonthSelector from "@/components/tide-table/MonthSelector";
import MinMaxChart from "@/components/tide-table/MinMaxChart";
import ContinuousTideChart from "@/components/tide-table/ContinuousTideChart";
import TideStatistics from "@/components/tide-table/TideStatistics";

const HARBOR = "sc01";

export default function TideTablePage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [brushRange, setBrushRange] = useState<[number, number] | null>(null);
  const { data, isLoading, error } = useTideTableData(HARBOR, selectedMonth);

  // Check if selected month is current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const isCurrentMonth = selectedMonth === currentMonth;

  // Transform data using custom hook
  const { chartData, continuousChartData } = useTideChartData(data);

  // Calculate brush range for current moment
  const { initialBrushRange, getNowRange, getTodayRange, getTomorrowRange, getPreviousDayRange, getNextDayRange } = useCurrentDayRange(
    continuousChartData,
    isCurrentMonth,
    currentDay
  );

  // Go to now button handler
  const goToNow = () => {
    const nowRange = getNowRange();
    if (nowRange) {
      setBrushRange(nowRange);
    }
  };

  // Go to today (noon) button handler
  const goToToday = () => {
    const todayRange = getTodayRange();
    if (todayRange) {
      setBrushRange(todayRange);
    }
  };

  // Go to tomorrow (noon) button handler
  const goToTomorrow = () => {
    const tomorrowRange = getTomorrowRange();
    if (tomorrowRange) {
      setBrushRange(tomorrowRange);
    }
  };

  // Go to previous day (noon) button handler
  const goToPreviousDay = (baseDay: number) => {
    const previousDayRange = getPreviousDayRange(baseDay);
    if (previousDayRange) {
      setBrushRange(previousDayRange);
    }
  };

  // Go to next day (noon) button handler
  const goToNextDay = (baseDay: number) => {
    const nextDayRange = getNextDayRange(baseDay);
    if (nextDayRange) {
      setBrushRange(nextDayRange);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        title="Erro ao carregar dados da tábua de maré"
        description={error.message || "Não foi possível obter os dados da tábua de maré. Por favor, tente novamente mais tarde."}
        type="error"
        showIcon
        style={{ marginTop: "24px" }}
      />
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <MonthSelector
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        data={data}
      />

      <MinMaxChart
        chartData={chartData}
        isCurrentMonth={isCurrentMonth}
        currentDay={currentDay}
      />

      <ContinuousTideChart
        data={continuousChartData}
        isCurrentMonth={isCurrentMonth}
        brushRange={brushRange}
        initialBrushRange={initialBrushRange}
        onBrushChange={setBrushRange}
        onGoToNow={goToNow}
        onGoToToday={goToToday}
        onGoToTomorrow={goToTomorrow}
        onGoToPreviousDay={goToPreviousDay}
        onGoToNextDay={goToNextDay}
      />

      <TideStatistics
        chartData={chartData}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
