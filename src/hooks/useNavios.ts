import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { ShipListResponse, fetchAnchoredShips } from "@/services/shipService";

/**
 * Hook to fetch anchored ships data
 * Uses React Query for caching and automatic refetching
 */
export function useNavios(): UseQueryResult<ShipListResponse, Error> {
    return useQuery<ShipListResponse, Error>({
        queryKey: ["navios", "anchored"],
        queryFn: fetchAnchoredShips,
        staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    });
}
