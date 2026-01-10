import { UseQueryResult } from "@tanstack/react-query";
import { TideDataWithInterpolation } from "@/services/tideService";
import { useTideDataForMonth } from "./useTideDataForMonth";

/**
 * Hook to fetch tide data for the current month
 * 
 * @param harbor - Harbor ID (e.g., 'sc01')
 * @returns Query result with current month's tide data including interpolated continuous data points
 */
export function useCurrentTide(
  harbor: string = "sc01"
): UseQueryResult<TideDataWithInterpolation, Error> {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  
  return useTideDataForMonth(harbor, currentMonth);
}

