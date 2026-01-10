import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchTideData, TideResponse } from "@/services/tideService";

export function useTideData(): UseQueryResult<TideResponse, Error> {
  return useQuery<TideResponse, Error>({
    queryKey: ["tideData"],
    queryFn: fetchTideData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

