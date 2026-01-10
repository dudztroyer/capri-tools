import { useMemo } from "react";
import { TideTableResponse } from "@/services/tideService";

interface ChartDataPoint {
  day: number;
  min: number;
  max: number;
  avg: number;
}

interface ContinuousDataPoint {
  day: number;
  hour: number;
  minute: number;
  timestamp: string;
  height: number;
  sortKey: number;
  isDirectionChange?: boolean;
  direction?: "up" | "down"; // "up" = maré subindo (mínimo), "down" = maré descendo (máximo)
}

export function useTideChartData(data?: TideTableResponse) {
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

  // Transform data for continuous chart - all hours of all days with 15min interpolation
  const continuousChartData = useMemo<ContinuousDataPoint[]>(() => {
    if (!data?.data || data.data.length === 0) return [];

    // Sort entries by day, then by hour and minute
    const sortedEntries = [...data.data].sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });

    // Helper function to convert day/hour/minute to total minutes
    const toMinutes = (day: number, hour: number, minute: number) => {
      return day * 24 * 60 + hour * 60 + minute;
    };

    // Helper function to convert total minutes back to day/hour/minute
    const fromMinutes = (totalMinutes: number) => {
      const day = Math.floor(totalMinutes / (24 * 60));
      const remainingMinutes = totalMinutes % (24 * 60);
      const hour = Math.floor(remainingMinutes / 60);
      const minute = remainingMinutes % 60;
      return { day, hour, minute };
    };

    // Helper function for smooth cubic interpolation (smoothstep)
    const smoothstep = (t: number): number => {
      return t * t * (3 - 2 * t);
    };

    // Helper function for smooth interpolation using cubic easing
    const interpolate = (x1: number, y1: number, x2: number, y2: number, x: number) => {
      if (x2 === x1) return y1;
      // Normalize x to [0, 1] range
      const t = (x - x1) / (x2 - x1);
      // Apply smoothstep function for smooth curve
      const smoothT = smoothstep(t);
      // Interpolate between y1 and y2 using smoothed t
      return y1 + (y2 - y1) * smoothT;
    };

    const interpolatedData: ContinuousDataPoint[] = [];

    // Process each pair of consecutive points
    for (let i = 0; i < sortedEntries.length; i++) {
      const current = sortedEntries[i];
      const currentMinutes = toMinutes(current.day, current.hour, current.minute);

      // Add the current point
      const hourStr = current.hour.toString().padStart(2, "0");
      const minuteStr = current.minute.toString().padStart(2, "0");
      interpolatedData.push({
        day: current.day,
        hour: current.hour,
        minute: current.minute,
        timestamp: `${current.day}/${hourStr}:${minuteStr}`,
        height: current.height,
        sortKey: current.day * 10000 + current.hour * 100 + current.minute,
      });

      // If there's a next point, interpolate between them
      if (i < sortedEntries.length - 1) {
        const next = sortedEntries[i + 1];
        const nextMinutes = toMinutes(next.day, next.hour, next.minute);
        const timeDiff = nextMinutes - currentMinutes;

        // Only interpolate if the gap is more than 15 minutes
        if (timeDiff > 15) {
          // Find the next 15-minute rounded time (00, 15, 30, 45)
          const getNextRoundedTime = (minutes: number) => {
            const { day, hour, minute } = fromMinutes(minutes);
            // Round up to next 15-minute interval (0, 15, 30, 45)
            let roundedMinute: number;
            if (minute === 0) {
              roundedMinute = 15;
            } else if (minute <= 15) {
              roundedMinute = 15;
            } else if (minute <= 30) {
              roundedMinute = 30;
            } else if (minute <= 45) {
              roundedMinute = 45;
            } else {
              roundedMinute = 0;
              const roundedHour = hour + 1;
              if (roundedHour >= 24) {
                return toMinutes(day + 1, 0, 0);
              }
              return toMinutes(day, roundedHour, 0);
            }
            return toMinutes(day, hour, roundedMinute);
          };

          // Start from the next rounded 15-minute interval
          let interpolatedMinutes = getNextRoundedTime(currentMinutes);
          
          // Generate points every 15 minutes (00, 15, 30, 45) between current and next
          while (interpolatedMinutes < nextMinutes) {
            const { day, hour, minute } = fromMinutes(interpolatedMinutes);
            
            // Only add if minute is 0, 15, 30, or 45
            if (minute === 0 || minute === 15 || minute === 30 || minute === 45) {
              const interpolatedHeight = interpolate(
                currentMinutes,
                current.height,
                nextMinutes,
                next.height,
                interpolatedMinutes
              );

              const hourStr = hour.toString().padStart(2, "0");
              const minuteStr = minute.toString().padStart(2, "0");

              interpolatedData.push({
                day,
                hour,
                minute,
                timestamp: `${day}/${hourStr}:${minuteStr}`,
                height: interpolatedHeight,
                sortKey: day * 10000 + hour * 100 + minute,
              });
            }

            // Move to next 15-minute interval
            interpolatedMinutes += 15;
          }
        }
      }
    }

    // Sort by sortKey to ensure correct order
    return interpolatedData.sort((a, b) => a.sortKey - b.sortKey);
  }, [data]);

  return { chartData, continuousChartData };
}

