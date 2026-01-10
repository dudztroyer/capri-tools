import { useMemo } from "react";

interface ContinuousDataPoint {
  day: number;
  hour: number;
  minute: number;
  timestamp: string;
  height: number;
  sortKey: number;
}

export function useCurrentDayRange(
  continuousChartData: ContinuousDataPoint[],
  isCurrentMonth: boolean,
  currentDay: number
) {
  // Calculate initial brush range for current moment (13h before and 13h after)
  const initialBrushRange = useMemo<[number, number] | null>(() => {
    if (!isCurrentMonth || continuousChartData.length === 0) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Find the closest point to current time (can be in current day or adjacent days)
    let closestIndex = -1;
    let minDiff = Infinity;
    
    for (let i = 0; i < continuousChartData.length; i++) {
      const point = continuousChartData[i];
      // Check if point is in current day or within 1 day range
      const dayDiff = Math.abs(point.day - currentDay);
      if (dayDiff <= 1) {
        // Calculate time difference in minutes, considering day difference
        const pointMinutes = point.day * 24 * 60 + point.hour * 60 + point.minute;
        const currentMinutes = currentDay * 24 * 60 + currentHour * 60 + currentMinute;
        const diff = Math.abs(pointMinutes - currentMinutes);
        
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
    }
    
    if (closestIndex === -1) return null;
    
    // Calculate 13 hours before and after (13 * 60 / 15 = 52 points at 15min intervals)
    const pointsPerHour = 4; // 15 minutes = 4 points per hour
    const pointsRange = 13 * pointsPerHour; // 52 points = 13 hours
    
    const startIndex = Math.max(0, closestIndex - pointsRange);
    const endIndex = Math.min(continuousChartData.length - 1, closestIndex + pointsRange);
    
    return [startIndex, endIndex] as [number, number];
  }, [continuousChartData, isCurrentMonth, currentDay]);

  // Go to now function - show 13h before and 13h after current moment
  const getNowRange = (): [number, number] | null => {
    if (!isCurrentMonth || continuousChartData.length === 0) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Find the closest point to current time (can be in current day or adjacent days)
    let closestIndex = -1;
    let minDiff = Infinity;
    
    for (let i = 0; i < continuousChartData.length; i++) {
      const point = continuousChartData[i];
      // Check if point is in current day or within 1 day range
      const dayDiff = Math.abs(point.day - currentDay);
      if (dayDiff <= 1) {
        // Calculate time difference in minutes, considering day difference
        const pointMinutes = point.day * 24 * 60 + point.hour * 60 + point.minute;
        const currentMinutes = currentDay * 24 * 60 + currentHour * 60 + currentMinute;
        const diff = Math.abs(pointMinutes - currentMinutes);
        
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
    }
    
    if (closestIndex === -1) return null;
    
    // Calculate 13 hours before and after (13 * 60 / 15 = 52 points at 15min intervals)
    const pointsPerHour = 4; // 15 minutes = 4 points per hour
    const pointsRange = 13 * pointsPerHour; // 52 points = 13 hours
    
    const startIndex = Math.max(0, closestIndex - pointsRange);
    const endIndex = Math.min(continuousChartData.length - 1, closestIndex + pointsRange);
    
    return [startIndex, endIndex];
  };

  return { initialBrushRange, getNowRange };
}

