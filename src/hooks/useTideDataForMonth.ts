import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchTideData, TideDataWithInterpolation } from "@/services/tideService";

/**
 * Hook to fetch tide data with interpolation for a specific harbor and month
 * 
 * @param harbor - Harbor ID (e.g., 'sc01')
 * @param month - Month number (1-12)
 * @returns Query result with tide data including interpolated continuous data points
 */
export function useTideDataForMonth(
  harbor: string,
  month: number
): UseQueryResult<TideDataWithInterpolation, Error> {
  return useQuery<TideDataWithInterpolation, Error>({
    queryKey: ["tideData", harbor, month],
    queryFn: () => fetchTideData(harbor, month),
    staleTime: Infinity, // Data doesn't change once fetched for a specific month
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    enabled: harbor !== "" && month >= 1 && month <= 12,
  });
}

