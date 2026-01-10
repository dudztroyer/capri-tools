import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchTideData, fetchTideTableData, TideTableResponse, TideResponse } from "@/services/tideService";
import { useTideChartData } from "./useTideChartData";

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

interface ContinuousDataPoint {
  day: number;
  hour: number;
  minute: number;
  height: number;
  month?: number;
  year?: number;
  direction?: "up" | "down"; // Direção da maré neste ponto
}

/**
 * Creates a Date object from continuous data point
 */
function createDateFromPoint(
  point: ContinuousDataPoint,
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
  points: ContinuousDataPoint[],
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
  function getDirection(point1: ContinuousDataPoint, point2: ContinuousDataPoint): "up" | "down" | undefined {
    if (point2.height > point1.height) {
      return "up";
    } else if (point2.height < point1.height) {
      return "down";
    }
    return undefined;
  }

  // Group consecutive passable points into windows
  let windowStart: Date | null = null;
  let lastPassablePoint: ContinuousDataPoint | null = null;
  let windowPoints: ContinuousDataPoint[] = [];

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
 * Calculates lancha passa data from continuous tide data points and current tide
 * Handles points from multiple months
 */
function calculateLanchaPassaDataFromPoints(
  points: ContinuousDataPoint[],
  currentTide: TideResponse
): LanchaPassaData {
  const now = new Date();
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  // Check current status using real-time tide data
  const currentHeight = currentTide.current.height;
  const isPassingNow = isPassable(currentHeight);

  // Calculate current direction by finding the closest point to now and comparing with next point
  let currentDirection: "up" | "down" | undefined;
  const sortedPoints = [...points].sort((a, b) => {
    const dateA = createDateFromPoint(a);
    const dateB = createDateFromPoint(b);
    return dateA.getTime() - dateB.getTime();
  });

  // Find the closest point to now
  const nowTime = now.getTime();
  let closestPoint: ContinuousDataPoint | undefined;
  let closestIndex = -1;
  let minDiff = Infinity;

  for (let i = 0; i < sortedPoints.length; i++) {
    const pointDate = createDateFromPoint(sortedPoints[i]);
    const diff = Math.abs(pointDate.getTime() - nowTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestPoint = sortedPoints[i];
      closestIndex = i;
    }
  }

  // Determine direction by comparing with next point
  if (closestPoint && closestIndex >= 0 && closestIndex < sortedPoints.length - 1) {
    const nextPoint = sortedPoints[closestIndex + 1];
    if (nextPoint.height > closestPoint.height) {
      currentDirection = "up";
    } else if (nextPoint.height < closestPoint.height) {
      currentDirection = "down";
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
 * Fetches and calculates lancha passa data using granular interpolated data
 */
async function fetchLanchaPassaData(): Promise<LanchaPassaData> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch current tide data for real-time status
  const currentTide = await fetchTideData();

  // Fetch current month data
  const currentMonthData = await fetchTideTableData("sc01", currentMonth);

  // If we need data beyond current month (for 7 days ahead)
  const allMonthData: TideTableResponse[] = [currentMonthData];
  
  const daysUntilMonthEnd = new Date(currentYear, currentMonth, 0).getDate() - now.getDate();
  
  if (daysUntilMonthEnd < 7) {
    // Fetch next month data
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    try {
      const nextMonthData = await fetchTideTableData("sc01", nextMonth);
      allMonthData.push(nextMonthData);
    } catch (error) {
      console.error("Error fetching next month data:", error);
    }
  }

  // Combine all data and get continuous chart data (interpolated at 15-minute intervals)
  const allPoints: ContinuousDataPoint[] = [];
  
  for (const monthData of allMonthData) {
    const month = monthData.month || currentMonth;
    const year = monthData.year || currentYear;
    
    // Use useTideChartData logic to get interpolated points
    // Since we can't use hooks in async functions, we'll replicate the interpolation logic
    const sortedEntries = [...monthData.data].sort((a, b) => {
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
      const t = (x - x1) / (x2 - x1);
      const smoothT = smoothstep(t);
      return y1 + (y2 - y1) * smoothT;
    };

    // Process each pair of consecutive points
    for (let i = 0; i < sortedEntries.length; i++) {
      const current = sortedEntries[i];
      const currentMinutes = toMinutes(current.day, current.hour, current.minute);

      // Determine direction based on next original point
      let direction: "up" | "down" | undefined;
      if (i < sortedEntries.length - 1) {
        const next = sortedEntries[i + 1];
        if (next.height > current.height) {
          direction = "up"; // Próximo ponto é maior, maré está subindo
        } else if (next.height < current.height) {
          direction = "down"; // Próximo ponto é menor, maré está descendo
        }
      } else if (i > 0) {
        // Last point: use previous point to determine direction
        const prev = sortedEntries[i - 1];
        if (current.height > prev.height) {
          direction = "up"; // Ponto atual é maior que anterior, estava subindo
        } else if (current.height < prev.height) {
          direction = "down"; // Ponto atual é menor que anterior, estava descendo
        }
      }

      // Add the current point (original from API)
      allPoints.push({
        day: current.day,
        hour: current.hour,
        minute: current.minute,
        height: current.height,
        month,
        year,
        direction,
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

              // Determine direction for interpolated point
              const interpolatedDirection = next.height > current.height ? "up" : 
                                          next.height < current.height ? "down" : undefined;

              allPoints.push({
                day,
                hour,
                minute,
                height: interpolatedHeight,
                month,
                year,
                direction: interpolatedDirection,
              });
            }

            // Move to next 15-minute interval
            interpolatedMinutes += 15;
          }
        }
      }
    }
  }

  // Calculate with all interpolated points
  return calculateLanchaPassaDataFromPoints(allPoints, currentTide);
}

/**
 * Hook to get lancha passa status and windows
 */
export function useLanchaPassa(): UseQueryResult<LanchaPassaData, Error> {
  return useQuery<LanchaPassaData, Error>({
    queryKey: ["lanchaPassa"],
    queryFn: fetchLanchaPassaData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });
}

