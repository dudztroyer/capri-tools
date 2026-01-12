import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
    FishingForecastData,
    getFishingForecast,
} from "@/services/fishingWeatherService";

/**
 * Hook to fetch fishing forecast data from Open-Meteo API
 * @param days Number of days to forecast (max 14, limited by Open-Meteo's 16 day max)
 */
export function useFishingForecast(
    days: number = 14
): UseQueryResult<FishingForecastData, Error> {
    return useQuery({
        queryKey: ["fishingForecast", days],
        queryFn: () => getFishingForecast(days),
        staleTime: 30 * 60 * 1000, // 30 minutes
        refetchInterval: 60 * 60 * 1000, // Refetch every hour
    });
}
