import { useMemo } from "react";
import { TideDataWithInterpolation, ContinuousDataPoint } from "@/services/tideService";

interface ChartDataPoint {
  day: number;
  min: number;
  max: number;
  avg: number;
}

export function useTideChartData(data?: TideDataWithInterpolation) {
  // Transform data for chart - group by day and show min/max/avg tide heights
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data?.data || data.data.length === 0) return [];

    // Group tide entries by day
    const dayGroups: Record<number, number[]> = {};
    
    data.data.forEach((entry) => {
      if (!dayGroups[entry.day]) {
        dayGroups[entry.day] = [];
      }
      dayGroups[entry.day].push(entry.height);
    });

    // Calculate statistics for each day
    return Object.keys(dayGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .map((day) => {
        const heights = dayGroups[day];
        return {
          day,
          min: Math.min(...heights),
          max: Math.max(...heights),
          avg: heights.reduce((sum, h) => sum + h, 0) / heights.length,
        };
      });
  }, [data]);

  // Use the continuous data directly from the service (already interpolated)
  const continuousChartData = useMemo<ContinuousDataPoint[]>(() => {
    return data?.continuousData || [];
  }, [data]);

  return { chartData, continuousChartData };
}

