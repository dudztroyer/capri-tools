import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
    fetchOpenMeteoForecast,
    parseOpenMeteoResponse,
    OpenMeteoResponse,
    ParsedWeatherData,
} from "@/services/openMeteoService";

/**
 * Hook to fetch raw Open-Meteo data
 */
export function useOpenMeteoRaw(
    forecastDays: number = 16
): UseQueryResult<OpenMeteoResponse, Error> {
    return useQuery({
        queryKey: ["openMeteo", "raw", forecastDays],
        queryFn: () => fetchOpenMeteoForecast(forecastDays),
        staleTime: 30 * 60 * 1000, // 30 minutes
        refetchInterval: 60 * 60 * 1000, // Refetch every hour
    });
}

/**
 * Hook to fetch and parse Open-Meteo data
 */
export function useOpenMeteo(
    forecastDays: number = 16
): UseQueryResult<ParsedWeatherData, Error> {
    return useQuery({
        queryKey: ["openMeteo", "parsed", forecastDays],
        queryFn: async () => {
            const raw = await fetchOpenMeteoForecast(forecastDays);
            return parseOpenMeteoResponse(raw);
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
        refetchInterval: 60 * 60 * 1000, // Refetch every hour
    });
}
