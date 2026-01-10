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

