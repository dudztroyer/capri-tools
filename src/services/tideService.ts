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

/**
 * Fetches tide data for São Francisco do Sul, Brazil
 * 
 * Note: This implementation uses simulated data based on realistic tide patterns.
 * For production, replace with an actual Brazilian tide API such as:
 * - CHM (Centro de Hidrografia da Marinha) API
 * - Brazilian Navy tide stations
 * - Or integrate with a global tide service that covers Brazil
 */
export async function fetchTideData(): Promise<TideResponse> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeOfDay = hours + minutes / 60;

    // Simulate realistic tide patterns for São Francisco do Sul
    // Tides typically cycle every ~12.5 hours (semi-diurnal)
    // Using a sine wave to simulate natural tide patterns
    const tideCycle = (timeOfDay / 12.5) * 2 * Math.PI;
    const baseHeight = 0.9; // Average tide level
    const amplitude = 0.5; // Tide variation
    const currentHeight = baseHeight + amplitude * Math.sin(tideCycle);

    // Calculate next high and low tides
    const nextHighTime = new Date(now);
    const nextLowTime = new Date(now);
    
    // Find next high tide (peak of sine wave)
    let nextHighOffset = 0;
    while (Math.sin((timeOfDay + nextHighOffset) / 12.5 * 2 * Math.PI) < 0.9) {
      nextHighOffset += 0.1;
    }
    nextHighTime.setHours(hours + Math.floor(nextHighOffset), minutes + (nextHighOffset % 1) * 60);
    
    // Find next low tide (trough of sine wave)
    let nextLowOffset = 0;
    while (Math.sin((timeOfDay + nextLowOffset) / 12.5 * 2 * Math.PI) > -0.9) {
      nextLowOffset += 0.1;
    }
    nextLowTime.setHours(hours + Math.floor(nextLowOffset), minutes + (nextLowOffset % 1) * 60);

    const nextHighHeight = baseHeight + amplitude;
    const nextLowHeight = baseHeight - amplitude;

    return {
      current: {
        height: Math.max(0.2, Math.min(1.8, currentHeight)), // Clamp between realistic values
        timestamp: now.toISOString(),
        station: "São Francisco do Sul",
      },
      nextHigh: {
        height: Math.max(0.2, Math.min(1.8, nextHighHeight)),
        timestamp: nextHighTime.toISOString(),
        station: "São Francisco do Sul",
      },
      nextLow: {
        height: Math.max(0.2, Math.min(1.8, nextLowHeight)),
        timestamp: nextLowTime.toISOString(),
        station: "São Francisco do Sul",
      },
    };
  } catch (error) {
    console.error("Error fetching tide data:", error);
    throw new Error("Failed to fetch tide data");
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

