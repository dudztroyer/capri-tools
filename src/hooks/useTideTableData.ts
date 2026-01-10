import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchTideTableData, TideTableResponse } from "@/services/tideService";

export function useTideTableData(
  harbor: string,
  month: number
): UseQueryResult<TideTableResponse, Error> {
  return useQuery<TideTableResponse, Error>({
    queryKey: ["tideTableData", harbor, month],
    queryFn: () => fetchTideTableData(harbor, month),
    staleTime: Infinity, // Data doesn't change once fetched for a specific month
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    enabled: harbor !== "" && month >= 1 && month <= 12,
  });
}

