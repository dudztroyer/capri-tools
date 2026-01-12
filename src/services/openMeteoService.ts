// Open-Meteo Weather Service
// Fetches real weather data for fishing forecast

// Fishing points definition - centralized location data
export const FISHING_POINTS = {
    A: {
        id: "A" as const,
        name: "Capri",
        description: "Águas protegidas dentro da baía",
        coordinates: { lat: -26.251, lng: -48.689 },
    },
    B: {
        id: "B" as const,
        name: "Ilhas",
        description: "Região das ilhas, saída da baía",
        coordinates: { lat: -26.187, lng: -48.486 },
    },
    C: {
        id: "C" as const,
        name: "Mar Aberto",
        description: "Algumas milhas fora da baía",
        coordinates: { lat: -26.120270, lng: -48.287171 },
    },
} as const;

export type FishingPointId = keyof typeof FISHING_POINTS;

// API Response types
export interface OpenMeteoHourlyUnits {
    time: string;
    temperature_2m: string;
    wind_speed_10m: string;
    wind_gusts_10m: string;
    wind_direction_10m: string;
    rain: string;
    precipitation: string;
    precipitation_probability: string;
    showers: string;
}

export interface OpenMeteoHourlyData {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
    rain: number[];
    precipitation: number[];
    precipitation_probability: number[];
    showers: number[];
}

export interface OpenMeteoLocationData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    hourly_units: OpenMeteoHourlyUnits;
    hourly: OpenMeteoHourlyData;
}

export type OpenMeteoResponse = OpenMeteoLocationData[];

// Parsed/structured data for easier consumption
export interface WeatherPoint {
    timestamp: Date;
    temperature: number;
    windSpeed: number;
    windGusts: number;
    windDirection: number;
    rain: number;
    precipitation: number;
    precipitationProbability: number;
    showers: number;
}

export interface LocationWeather {
    locationId: FishingPointId;
    locationName: string;
    latitude: number;
    longitude: number;
    data: WeatherPoint[];
}

export interface ParsedWeatherData {
    fetchedAt: Date;
    locations: LocationWeather[];
}

const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";

/**
 * Fetches weather forecast from Open-Meteo API for the 3 fishing points
 * @param forecastDays Number of days to forecast (max 16)
 */
export async function fetchOpenMeteoForecast(
    forecastDays: number = 16
): Promise<OpenMeteoResponse> {
    const latitudes = [
        FISHING_POINTS.A.coordinates.lat,
        FISHING_POINTS.B.coordinates.lat,
        FISHING_POINTS.C.coordinates.lat,
    ].join(",");

    const longitudes = [
        FISHING_POINTS.A.coordinates.lng,
        FISHING_POINTS.B.coordinates.lng,
        FISHING_POINTS.C.coordinates.lng,
    ].join(",");

    const params = new URLSearchParams({
        latitude: latitudes,
        longitude: longitudes,
        hourly: [
            "temperature_2m",
            "wind_speed_10m",
            "wind_gusts_10m",
            "wind_direction_10m",
            "rain",
            "precipitation",
            "precipitation_probability",
            "showers",
        ].join(","),
        forecast_days: forecastDays.toString(),
        cell_selection: "sea",
    });

    const url = `${OPEN_METEO_API_URL}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as OpenMeteoResponse;
}

/**
 * Parses the raw Open-Meteo response into a more usable format
 */
export function parseOpenMeteoResponse(response: OpenMeteoResponse): ParsedWeatherData {
    const pointIds: FishingPointId[] = ["A", "B", "C"];

    const locations: LocationWeather[] = response.map((locationData, index) => {
        const pointId = pointIds[index];
        const pointDef = FISHING_POINTS[pointId];

        const data: WeatherPoint[] = locationData.hourly.time.map((time, i) => ({
            timestamp: new Date(time),
            temperature: locationData.hourly.temperature_2m[i] ?? 0,
            windSpeed: locationData.hourly.wind_speed_10m[i] ?? 0,
            windGusts: locationData.hourly.wind_gusts_10m[i] ?? 0,
            windDirection: locationData.hourly.wind_direction_10m[i] ?? 0,
            rain: locationData.hourly.rain[i] ?? 0,
            precipitation: locationData.hourly.precipitation[i] ?? 0,
            precipitationProbability: locationData.hourly.precipitation_probability[i] ?? 0,
            showers: locationData.hourly.showers[i] ?? 0,
        }));

        return {
            locationId: pointId,
            locationName: pointDef.name,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            data,
        };
    });

    return {
        fetchedAt: new Date(),
        locations,
    };
}
