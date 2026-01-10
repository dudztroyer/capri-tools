export interface TideData {
  height: number;
  timestamp: string;
  station: string;
}

export interface TideResponse {
  current: TideData;
  nextHigh?: TideData;
  nextLow?: TideData;
}

export interface TideTableEntry {
  day: number;
  hour: number;
  minute: number;
  height: number;
  type: "high" | "low";
}

export interface TideTableResponse {
  harbor: string;
  harborName?: string;
  month: number;
  monthName?: string;
  year?: number;
  data: TideTableEntry[];
}

// API Response Types
export interface TideHour {
  hour: string; // Format: "HH:MM:SS"
  level: number;
}

export interface TideDay {
  weekday_name: string;
  day: number;
  hours: TideHour[];
}

export interface TideMonth {
  month_name: string;
  month: number;
  days: TideDay[];
}

export interface TideHarborData {
  id: string;
  year: number;
  harbor_name: string;
  state: string;
  timezone: string;
  card: string;
  data_collection_institution: string;
  mean_level: number;
  months: TideMonth[];
}

export interface TideTableApiResponse {
  data: TideHarborData[];
  total: number;
}

export interface ContinuousDataPoint {
  day: number;
  hour: number;
  minute: number;
  timestamp: string;
  height: number;
  sortKey: number;
  isOriginal?: boolean; // Flag to identify original points from API
  isDirectionChange?: boolean;
  direction?: "up" | "down"; // "up" = maré subindo (mínimo), "down" = maré descendo (máximo)
}

export interface TideDataWithInterpolation extends TideTableResponse {
  continuousData: ContinuousDataPoint[];
}

/**
 * Gets tide data for a specific harbor and month with interpolated 15-minute intervals
 * Fetches tide table data and adds interpolation calculations
 * 
 * @param harbor - Harbor ID (e.g., 'sc01')
 * @param month - Month number (1-12)
 * @returns Promise with tide table data plus interpolated continuous data points
 */
export async function getTideDataWithInterpolation(
  harbor: string,
  month: number
): Promise<TideDataWithInterpolation> {
  try {
    // Fetch the base tide table data
    const tideTableData = await fetchTideTableData(harbor, month);

    // If no data, return empty structure
    if (!tideTableData.data || tideTableData.data.length === 0) {
      return {
        ...tideTableData,
        continuousData: [],
      };
    }

    // Sort entries by day, then by hour and minute
    const sortedEntries = [...tideTableData.data].sort((a, b) => {
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
      const hourStr = current.hour.toString().padStart(2, "0");
      const minuteStr = current.minute.toString().padStart(2, "0");
      interpolatedData.push({
        day: current.day,
        hour: current.hour,
        minute: current.minute,
        timestamp: `${current.day}/${hourStr}:${minuteStr}`,
        height: current.height,
        sortKey: current.day * 10000 + current.hour * 100 + current.minute,
        isOriginal: true, // Mark as original point
        isDirectionChange: true, // All original points are direction changes
        direction: direction,
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
    const sortedData = interpolatedData.sort((a, b) => a.sortKey - b.sortKey);

    return {
      ...tideTableData,
      continuousData: sortedData,
    };
  } catch (error) {
    console.error("Error fetching tide data:", error);
    throw new Error(`Failed to fetch tide data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Fetches tide table data for a specific harbor and month
 * 
 * @param harbor - Harbor ID (e.g., 'sc01')
 * @param month - Month number (1-12)
 * @returns Promise with tide table data for all days in the month
 */
export async function fetchTideTableData(
  harbor: string,
  month: number
): Promise<TideTableResponse> {
  try {
    // Validate month
    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }

    // Get number of days in the month
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, month, 0).getDate();
    
    // Format days as [1-31] for all days in the month
    // URL encode the brackets and dash
    const daysRange = encodeURIComponent(`[1-${daysInMonth}]`);
    
    // Use local API proxy to avoid CORS issues
    const url = `/api/tide-table?harbor=${encodeURIComponent(harbor)}&month=${month}&days=${daysRange}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tide table data: ${response.statusText}`);
    }
    
    const apiResponse: TideTableApiResponse = await response.json();
    
    // Transform the API response to our expected format
    if (!apiResponse.data || apiResponse.data.length === 0) {
      return {
        harbor,
        month,
        data: [],
      };
    }

    // Find the harbor data
    const harborData = apiResponse.data.find((h) => h.id === harbor);
    if (!harborData) {
      return {
        harbor,
        month,
        data: [],
      };
    }

    // Find the specific month
    const monthData = harborData.months.find((m) => m.month === month);
    if (!monthData) {
      return {
        harbor,
        month,
        data: [],
      };
    }

    // Transform the nested structure to flat array of tide entries
    const tideEntries: TideTableEntry[] = [];
    
    monthData.days.forEach((dayData) => {
      dayData.hours.forEach((hourData) => {
        // Parse hour string "HH:MM:SS" to hour and minute
        const [hourStr, minuteStr] = hourData.hour.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        
        // Determine if it's high or low tide based on surrounding values
        // This is a simple heuristic - you might want to improve this
        const isHigh = hourData.level > harborData.mean_level;
        
        tideEntries.push({
          day: dayData.day,
          hour,
          minute,
          height: hourData.level,
          type: isHigh ? "high" : "low",
        });
      });
    });

    return {
      harbor,
      harborName: harborData.harbor_name,
      month,
      monthName: monthData.month_name,
      year: harborData.year,
      data: tideEntries,
    };
  } catch (error) {
    console.error("Error fetching tide table data:", error);
    throw new Error(`Failed to fetch tide table data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

