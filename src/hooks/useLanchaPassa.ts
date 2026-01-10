import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import { TideDataWithInterpolation, ContinuousDataPoint, getTideDataWithInterpolation } from "@/services/tideService";
import { useTideDataForMonth } from "./useTideDataForMonth";
import { useClientDate } from "./useClientDate";

export interface PassagemWindow {
  start: Date;
  end: Date;
  date: Date;
  risingCount: number; // Quantas vezes a maré está subindo dentro da janela
  fallingCount: number; // Quantas vezes a maré está descendo dentro da janela
  initialDirection?: "up" | "down"; // Direção da maré no início da janela
}

export interface LanchaPassaData {
  isPassingNow: boolean;
  currentWindowEnd?: Date;
  lastPassage?: Date;
  nextPassage?: Date;
  next7Days: PassagemWindow[];
  currentDirection?: "up" | "down"; // Direção atual da maré
}

const MIN_HEIGHT = 0.4;
const MAX_HEIGHT = 1.4;

/**
 * Checks if a tide height is within the passable range
 */
function isPassable(height: number): boolean {
  return height >= MIN_HEIGHT && height <= MAX_HEIGHT;
}

interface ContinuousDataPointWithMonth extends ContinuousDataPoint {
  month?: number;
  year?: number;
}

/**
 * Creates a Date object from continuous data point
 */
function createDateFromPoint(
  point: ContinuousDataPointWithMonth,
  year?: number,
  month?: number
): Date {
  const entryYear = point.year || year || new Date().getFullYear();
  const entryMonth = point.month || month || new Date().getMonth() + 1;
  return new Date(entryYear, entryMonth - 1, point.day, point.hour, point.minute);
}

/**
 * Finds passagem windows from continuous tide data
 * Windows are continuous periods where height is between MIN_HEIGHT and MAX_HEIGHT
 * Uses granular 15-minute interpolated data for better accuracy
 */
function findPassagemWindows(
  points: ContinuousDataPointWithMonth[],
  startDate: Date,
  endDate: Date
): PassagemWindow[] {
  const windows: PassagemWindow[] = [];
  
  // Sort points by date and time
  const sortedPoints = [...points].sort((a, b) => {
    const dateA = createDateFromPoint(a);
    const dateB = createDateFromPoint(b);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter points within date range
  const relevantPoints = sortedPoints.filter((point) => {
    const pointDate = createDateFromPoint(point);
    return pointDate >= startDate && pointDate <= endDate;
  });

  if (relevantPoints.length === 0) {
    return windows;
  }

  // Helper function to determine direction between two points
  function getDirection(point1: ContinuousDataPointWithMonth, point2: ContinuousDataPointWithMonth): "up" | "down" | undefined {
    if (point2.height > point1.height) {
      return "up";
    } else if (point2.height < point1.height) {
      return "down";
    }
    return undefined;
  }

  // Group consecutive passable points into windows
  let windowStart: Date | null = null;
  let lastPassablePoint: ContinuousDataPointWithMonth | null = null;
  let windowPoints: ContinuousDataPointWithMonth[] = [];

  for (let i = 0; i < relevantPoints.length; i++) {
    const point = relevantPoints[i];
    const pointDate = createDateFromPoint(point);
    const isPassableNow = isPassable(point.height);

    if (isPassableNow) {
      if (!windowStart) {
        // Start of a new window
        windowStart = pointDate;
        windowPoints = [point];
      } else {
        windowPoints.push(point);
      }
      lastPassablePoint = point;
    } else {
      if (windowStart && lastPassablePoint) {
        // End of a window - calculate direction counts
        const windowEnd = createDateFromPoint(lastPassablePoint);
        windowEnd.setMinutes(windowEnd.getMinutes() + 15);
        
        // Count direction changes within the window
        // Count only transitions: up->down or down->up
        let risingCount = 0;
        let fallingCount = 0;
        let prevDirection: "up" | "down" | undefined;
        let initialDirection: "up" | "down" | undefined;
        
        // Determine initial direction
        if (windowPoints.length > 0) {
          const firstPoint = windowPoints[0];
          
          // Try to get direction from the point itself
          if (firstPoint.direction) {
            initialDirection = firstPoint.direction;
          } else if (windowPoints.length > 1) {
            // Compare first two points
            initialDirection = getDirection(firstPoint, windowPoints[1]);
          } else {
            // Only one point - try to find direction by comparing with adjacent points
            const pointIndex = relevantPoints.findIndex(p => 
              p.day === firstPoint.day && 
              p.hour === firstPoint.hour && 
              p.minute === firstPoint.minute
            );
            
            if (pointIndex > 0) {
              // Compare with previous point
              const prevPoint = relevantPoints[pointIndex - 1];
              initialDirection = getDirection(prevPoint, firstPoint);
            } else if (pointIndex < relevantPoints.length - 1) {
              // Compare with next point
              const nextPoint = relevantPoints[pointIndex + 1];
              initialDirection = getDirection(firstPoint, nextPoint);
            }
          }
        }
        
        // Analyze direction by comparing consecutive points
        for (let j = 0; j < windowPoints.length - 1; j++) {
          const direction = getDirection(windowPoints[j], windowPoints[j + 1]);
          
          if (direction) {
            // Count only when direction actually changes (transitions)
            if (prevDirection !== undefined && direction !== prevDirection) {
              // Transition occurred
              if (direction === "up" && prevDirection === "down") {
                // Changed from falling to rising
                risingCount++;
              } else if (direction === "down" && prevDirection === "up") {
                // Changed from rising to falling
                fallingCount++;
              }
            }
            prevDirection = direction;
          }
        }
        
        windows.push({
          start: windowStart,
          end: windowEnd,
          date: windowStart,
          risingCount: Math.max(risingCount, 0),
          fallingCount: Math.max(fallingCount, 0),
          initialDirection,
        });
        windowStart = null;
        lastPassablePoint = null;
        windowPoints = [];
      }
    }
  }

  // If we're still in a window at the end
  if (windowStart && lastPassablePoint) {
    const windowEnd = createDateFromPoint(lastPassablePoint);
    windowEnd.setMinutes(windowEnd.getMinutes() + 15);
    
    // Calculate direction counts for the final window
    // Count only transitions: up->down or down->up
    let risingCount = 0;
    let fallingCount = 0;
    let prevDirection: "up" | "down" | undefined;
    let initialDirection: "up" | "down" | undefined;
    
    // Determine initial direction
    if (windowPoints.length > 0) {
      const firstPoint = windowPoints[0];
      
      // Try to get direction from the point itself
      if (firstPoint.direction) {
        initialDirection = firstPoint.direction;
      } else if (windowPoints.length > 1) {
        // Compare first two points
        initialDirection = getDirection(firstPoint, windowPoints[1]);
      } else {
        // Only one point - try to find direction by comparing with adjacent points
        const pointIndex = relevantPoints.findIndex(p => 
          p.day === firstPoint.day && 
          p.hour === firstPoint.hour && 
          p.minute === firstPoint.minute
        );
        
        if (pointIndex > 0) {
          // Compare with previous point
          const prevPoint = relevantPoints[pointIndex - 1];
          initialDirection = getDirection(prevPoint, firstPoint);
        } else if (pointIndex < relevantPoints.length - 1) {
          // Compare with next point
          const nextPoint = relevantPoints[pointIndex + 1];
          initialDirection = getDirection(firstPoint, nextPoint);
        }
      }
    }
    
    for (let j = 0; j < windowPoints.length - 1; j++) {
      const direction = getDirection(windowPoints[j], windowPoints[j + 1]);
      
      if (direction) {
        // Count only when direction actually changes (transitions)
        if (prevDirection !== undefined && direction !== prevDirection) {
          if (direction === "up" && prevDirection === "down") {
            // Changed from falling to rising
            risingCount++;
          } else if (direction === "down" && prevDirection === "up") {
            // Changed from rising to falling
            fallingCount++;
          }
        }
        prevDirection = direction;
      }
    }
    
    windows.push({
      start: windowStart,
      end: windowEnd,
      date: windowStart,
      risingCount: Math.max(risingCount, 0),
      fallingCount: Math.max(fallingCount, 0),
      initialDirection,
    });
  }

  return windows;
}

/**
 * Calculates lancha passa data from continuous tide data points
 * Handles points from multiple months
 */
function calculateLanchaPassaDataFromPoints(
  points: ContinuousDataPointWithMonth[]
): LanchaPassaData {
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  // Find current height from the closest point to now
  const sortedPoints = [...points].sort((a, b) => {
    const dateA = createDateFromPoint(a);
    const dateB = createDateFromPoint(b);
    return dateA.getTime() - dateB.getTime();
  });

  const nowTime = now.getTime();
  let closestPoint: ContinuousDataPointWithMonth | undefined;
  let minDiff = Infinity;

  for (let i = 0; i < sortedPoints.length; i++) {
    const pointDate = createDateFromPoint(sortedPoints[i]);
    const diff = Math.abs(pointDate.getTime() - nowTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestPoint = sortedPoints[i];
    }
  }

  // Check current status using closest point height
  const currentHeight = closestPoint?.height ?? 0;
  const isPassingNow = isPassable(currentHeight);

  // Calculate current direction by comparing closest point with next point
  let currentDirection: "up" | "down" | undefined;
  if (closestPoint) {
    const closestIndex = sortedPoints.findIndex(p => 
      p.day === closestPoint!.day && 
      p.hour === closestPoint!.hour && 
      p.minute === closestPoint!.minute
    );
    
    // Use direction from point if available, otherwise compare with next point
    if (closestPoint.direction) {
      currentDirection = closestPoint.direction;
    } else if (closestIndex >= 0 && closestIndex < sortedPoints.length - 1) {
      const nextPoint = sortedPoints[closestIndex + 1];
      if (nextPoint.height > closestPoint.height) {
        currentDirection = "up";
      } else if (nextPoint.height < closestPoint.height) {
        currentDirection = "down";
      }
    }
  }

  // Find all passagem windows from now to 7 days later
  const allWindows = findPassagemWindows(
    points,
    now,
    sevenDaysLater
  );

  // Filter windows for next 7 days
  const next7Days = allWindows.filter(
    (window) => window.start <= sevenDaysLater && window.start >= now
  );

  // Find current window end if passing now
  let currentWindowEnd: Date | undefined;
  if (isPassingNow) {
    const activeWindow = allWindows.find(
      (window) => window.start <= now && window.end >= now
    );
    if (activeWindow) {
      currentWindowEnd = activeWindow.end;
    } else {
      // If no window found but we're passing, estimate end time
      // Look for next non-passable point
      const sortedPoints = [...points].sort((a, b) => {
        const dateA = createDateFromPoint(a);
        const dateB = createDateFromPoint(b);
        return dateA.getTime() - dateB.getTime();
      });

      const futurePoints = sortedPoints.filter((point) => {
        const pointDate = createDateFromPoint(point);
        return pointDate > now && !isPassable(point.height);
      });

      if (futurePoints.length > 0) {
        const nextNonPassable = createDateFromPoint(futurePoints[0]);
        currentWindowEnd = nextNonPassable;
      }
    }
  }

  // Find last passage (before now) - look at past windows
  const pastWindows = findPassagemWindows(
    points,
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    now
  );
  const lastPassage =
    pastWindows.length > 0
      ? pastWindows[pastWindows.length - 1].end
      : undefined;

  // Find next passage (after now)
  const nextPassage =
    next7Days.length > 0 ? next7Days[0].start : undefined;

  return {
    isPassingNow,
    currentWindowEnd,
    lastPassage,
    nextPassage,
    next7Days,
    currentDirection,
  };
}

/**
 * Hook to get lancha passa status and windows
 * Uses React Query hooks to fetch tide data with caching
 */
export function useLanchaPassa(): UseQueryResult<LanchaPassaData, Error> {
  const harbor = "sc01";
  const { now, currentMonth, currentYear } = useClientDate();

  // Get current month data with interpolation using React Query
  const { data: currentMonthData, isLoading: isLoadingCurrent, error: errorCurrent } = useTideDataForMonth(harbor, currentMonth);

  // Determine if we need next month data
  const daysUntilMonthEnd = new Date(currentYear, currentMonth, 0).getDate() - now.getDate();
  const needsNextMonth = daysUntilMonthEnd < 7;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  // Get next month data conditionally using React Query
  const { data: nextMonthData, isLoading: isLoadingNext, error: errorNext } = useQuery<TideDataWithInterpolation, Error>({
    queryKey: ["tideData", harbor, nextMonth],
    queryFn: () => getTideDataWithInterpolation(harbor, nextMonth),
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    enabled: needsNextMonth && nextMonth >= 1 && nextMonth <= 12,
  });

  // Compute lancha passa data from the tide data queries using useMemo
  // This ensures the calculation happens when the dependent data changes
  const lanchaPassaData = useMemo<LanchaPassaData | undefined>(() => {
    if (!currentMonthData) return undefined;
    if (needsNextMonth && !nextMonthData) return undefined;

    const allPoints: ContinuousDataPointWithMonth[] = [];
    
    // Add current month's continuous data
    currentMonthData.continuousData.forEach(point => {
      allPoints.push({
        ...point,
        month: currentMonthData.month,
        year: currentMonthData.year,
      });
    });
    
    // Add next month's continuous data if available
    if (needsNextMonth && nextMonthData) {
      nextMonthData.continuousData.forEach(point => {
        allPoints.push({
          ...point,
          month: nextMonthData.month,
          year: nextMonthData.year || nextMonthYear,
        });
      });
    }

    // Calculate with all interpolated points
    return calculateLanchaPassaDataFromPoints(allPoints);
  }, [currentMonthData, nextMonthData, needsNextMonth, nextMonthYear]);

  // Determine loading state
  const isLoading = isLoadingCurrent || (needsNextMonth && isLoadingNext);

  // Use useQuery to provide caching and refetch behavior
  // The query depends on the underlying tide data queries, so it will automatically
  // update when those queries update (thanks to React Query's cache invalidation)
  return useQuery<LanchaPassaData, Error>({
    queryKey: ["lanchaPassa", harbor, currentMonth, nextMonth, needsNextMonth],
    queryFn: async () => {
      // This function will be called when the query needs to refetch
      // It will use the cached data from useTideDataForMonth queries
      if (!currentMonthData) {
        throw new Error("Current month tide data is not available");
      }
      if (needsNextMonth && !nextMonthData) {
        throw new Error("Next month tide data is not available");
      }

      const allPoints: ContinuousDataPointWithMonth[] = [];
      
      // Add current month's continuous data
      currentMonthData.continuousData.forEach(point => {
        allPoints.push({
          ...point,
          month: currentMonthData.month,
          year: currentMonthData.year,
        });
      });
      
      // Add next month's continuous data if available
      if (needsNextMonth && nextMonthData) {
        nextMonthData.continuousData.forEach(point => {
          allPoints.push({
            ...point,
            month: nextMonthData.month,
            year: nextMonthData.year || nextMonthYear,
          });
        });
      }

      return calculateLanchaPassaDataFromPoints(allPoints);
    },
    enabled: !isLoading && !!currentMonthData && (!needsNextMonth || !!nextMonthData),
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    placeholderData: lanchaPassaData, // Use computed data while loading
    initialData: lanchaPassaData, // Use computed data as initial data
  });
}

