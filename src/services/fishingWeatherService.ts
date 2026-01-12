// Fishing Weather Service
// Transforms Open-Meteo data into fishing forecast format

import {
    fetchOpenMeteoForecast,
    parseOpenMeteoResponse,
    ParsedWeatherData,
    LocationWeather,
    WeatherPoint,
    FISHING_POINTS,
    FishingPointId,
} from "./openMeteoService";

// Re-export FISHING_POINTS for consumers that import from this service
export { FISHING_POINTS, type FishingPointId };

// ============================================================================
// Types
// ============================================================================

export interface WindData {
    direction: number; // 0-360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
    speed: number; // km/h
    gusts: number; // km/h
}

export interface WeatherDataPoint {
    timestamp: Date;
    wind: WindData;
    precipitation: number; // mm
    temperature: number; // °C
}

export interface BayPointWeather {
    pointId: "A" | "B" | "C";
    pointName: string;
    description: string;
    coordinates: { lat: number; lng: number };
    data: WeatherDataPoint[];
}

export interface FishingCondition {
    score: "excellent" | "good" | "moderate" | "poor" | "dangerous";
    color: string;
    label: string;
    description: string;
}

export interface TimeWindow {
    start: Date;
    end: Date;
    type: "departure" | "return" | "danger";
    description: string;
}

export interface DayForecast {
    date: Date;
    overallCondition: FishingCondition;
    bestDepartureWindow: TimeWindow | null;
    suggestedReturnWindow: TimeWindow | null;
    dangerWindows: TimeWindow[];
    windChangeTime: Date | null;
    points: BayPointWeather[];
    summary: {
        maxWindSpeed: number;
        maxGusts: number;
        totalPrecipitation: number;
        calmMorningHours: number;
    };
}

export interface FishingForecastData {
    generatedAt: Date;
    forecasts: DayForecast[];
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getWindDirectionLabel(degrees: number): string {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

export function getWindDirectionArrow(degrees: number): string {
    const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
    const index = Math.round(degrees / 45) % 8;
    return arrows[index];
}

export function evaluateCondition(
    windSpeed: number,
    gusts: number,
    precipitation: number
): FishingCondition {
    const MAX_GOOD_WIND = 15;
    const MAX_MODERATE_WIND = 20;
    const MAX_GOOD_GUSTS = 20;
    const MAX_MODERATE_GUSTS = 25;

    if (precipitation > 0) {
        if (windSpeed > MAX_MODERATE_WIND || gusts > MAX_MODERATE_GUSTS) {
            return {
                score: "dangerous",
                color: "#ff4d4f",
                label: "Perigoso",
                description: "Chuva com ventos fortes - não sair",
            };
        }
        if (windSpeed > MAX_GOOD_WIND || gusts > MAX_GOOD_GUSTS) {
            return {
                score: "poor",
                color: "#fa8c16",
                label: "Ruim",
                description: "Chuva com ventos moderados",
            };
        }
        return {
            score: "moderate",
            color: "#faad14",
            label: "Moderado",
            description: "Chuva leve, mas navegável",
        };
    }

    if (windSpeed > MAX_MODERATE_WIND || gusts > MAX_MODERATE_GUSTS) {
        return {
            score: "dangerous",
            color: "#ff4d4f",
            label: "Perigoso",
            description: "Ventos muito fortes",
        };
    }

    if (windSpeed > MAX_GOOD_WIND || gusts > MAX_GOOD_GUSTS) {
        return {
            score: "poor",
            color: "#fa8c16",
            label: "Ruim",
            description: "Ventos acima do ideal",
        };
    }

    if (windSpeed > 10 || gusts > 15) {
        return {
            score: "moderate",
            color: "#faad14",
            label: "Moderado",
            description: "Ventos moderados, cuidado recomendado",
        };
    }

    if (windSpeed > 5) {
        return {
            score: "good",
            color: "#52c41a",
            label: "Bom",
            description: "Boas condições para pesca",
        };
    }

    return {
        score: "excellent",
        color: "#1890ff",
        label: "Excelente",
        description: "Condições ideais - mar calmo",
    };
}

// Format helpers
export function formatTime(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
    });
}

export function formatDateFull(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
    });
}

export function isToday(date: Date | string): boolean {
    const today = new Date();
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toDateString() === today.toDateString();
}

export function isTomorrow(date: Date | string): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toDateString() === tomorrow.toDateString();
}

// ============================================================================
// Data Transformation Functions
// ============================================================================



/**
 * Converts Open-Meteo WeatherPoint to our WeatherDataPoint format
 */
function convertToWeatherDataPoint(point: WeatherPoint): WeatherDataPoint {
    return {
        timestamp: point.timestamp,
        wind: {
            direction: Math.round(point.windDirection),
            speed: Math.round(point.windSpeed * 10) / 10,
            gusts: Math.round(point.windGusts * 10) / 10,
        },
        precipitation: Math.round((point.precipitation + point.rain + point.showers) * 10) / 10,
        temperature: Math.round(point.temperature * 10) / 10,
    };
}

/**
 * Converts Open-Meteo LocationWeather to our BayPointWeather format
 */
function convertToBayPointWeather(location: LocationWeather): BayPointWeather {
    const pointDef = FISHING_POINTS[location.locationId];

    return {
        pointId: location.locationId,
        pointName: pointDef.name,
        description: pointDef.description,
        coordinates: pointDef.coordinates,
        data: location.data.map(convertToWeatherDataPoint),
    };
}

/**
 * Groups weather data by day
 */
function groupDataByDay(data: WeatherDataPoint[]): Map<string, WeatherDataPoint[]> {
    const grouped = new Map<string, WeatherDataPoint[]>();

    for (const point of data) {
        const dateKey = point.timestamp.toDateString();
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(point);
    }

    return grouped;
}

/**
 * Detects wind direction change time (when wind shifts significantly)
 */
function detectWindChangeTime(data: WeatherDataPoint[]): Date | null {
    // Look for wind direction change from West (around 270°) to East (around 90°)
    // This typically happens between 11am and 3pm
    for (let i = 1; i < data.length; i++) {
        const prevDir = data[i - 1].wind.direction;
        const currDir = data[i].wind.direction;
        const hour = data[i].timestamp.getHours();

        // Check if we're in the typical wind change window (11am-3pm)
        if (hour >= 11 && hour <= 15) {
            // Check for significant direction change (from W quadrant to E quadrant)
            const wasWesterly = prevDir >= 180 && prevDir <= 360;
            const isEasterly = currDir >= 0 && currDir <= 180;

            if (wasWesterly && isEasterly) {
                return data[i].timestamp;
            }
        }
    }

    // Default to 13:00 if no clear change detected
    if (data.length > 0) {
        const firstDate = new Date(data[0].timestamp);
        firstDate.setHours(13, 0, 0, 0);
        return firstDate;
    }

    return null;
}

/**
 * Calculates time windows for a day's forecast
 */
function calculateTimeWindows(
    date: Date,
    data: WeatherDataPoint[],
    maxWindSpeed: number,
    calmMorningHours: number
): {
    bestDepartureWindow: TimeWindow | null;
    suggestedReturnWindow: TimeWindow | null;
    dangerWindows: TimeWindow[];
} {
    let bestDepartureWindow: TimeWindow | null = null;
    let suggestedReturnWindow: TimeWindow | null = null;
    const dangerWindows: TimeWindow[] = [];

    // Best departure: 6am - 8am when conditions are calm
    if (calmMorningHours >= 1) {
        const departStart = new Date(date);
        departStart.setHours(6, 0, 0, 0);
        const departEnd = new Date(date);
        departEnd.setHours(8, 0, 0, 0);
        bestDepartureWindow = {
            start: departStart,
            end: departEnd,
            type: "departure",
            description: "Manhã calma - ideal para saída",
        };
    }

    // Suggested return: before wind picks up too much (before 1pm)
    const returnStart = new Date(date);
    returnStart.setHours(11, 0, 0, 0);
    const returnEnd = new Date(date);
    returnEnd.setHours(13, 0, 0, 0);
    suggestedReturnWindow = {
        start: returnStart,
        end: returnEnd,
        type: "return",
        description: "Retornar antes da mudança do vento",
    };

    // Find danger windows based on actual data
    let dangerStart: Date | null = null;
    for (const point of data) {
        const isDangerous = point.wind.speed > 20 || point.wind.gusts > 25;

        if (isDangerous && !dangerStart) {
            dangerStart = point.timestamp;
        } else if (!isDangerous && dangerStart) {
            dangerWindows.push({
                start: dangerStart,
                end: point.timestamp,
                type: "danger",
                description: "Ventos fortes - evitar navegação",
            });
            dangerStart = null;
        }
    }

    // Close any open danger window
    if (dangerStart && data.length > 0) {
        dangerWindows.push({
            start: dangerStart,
            end: data[data.length - 1].timestamp,
            type: "danger",
            description: "Ventos fortes - evitar navegação",
        });
    }

    return { bestDepartureWindow, suggestedReturnWindow, dangerWindows };
}

/**
 * Creates a DayForecast from grouped point data
 */
function createDayForecast(
    date: Date,
    pointsData: Map<string, WeatherDataPoint[]>
): DayForecast {
    // Build points array
    const points: BayPointWeather[] = [];
    const pointIds: Array<"A" | "B" | "C"> = ["A", "B", "C"];

    for (const pointId of pointIds) {
        const pointDef = FISHING_POINTS[pointId];
        const data = pointsData.get(pointId) || [];

        points.push({
            pointId,
            pointName: pointDef.name,
            description: pointDef.description,
            coordinates: pointDef.coordinates,
            data,
        });
    }

    // Calculate summary from point C (most exposed)
    const pointCData = pointsData.get("C") || [];

    let maxWindSpeed = 0;
    let maxGusts = 0;
    let totalPrecipitation = 0;
    let calmMorningHours = 0;

    for (const dataPoint of pointCData) {
        maxWindSpeed = Math.max(maxWindSpeed, dataPoint.wind.speed);
        maxGusts = Math.max(maxGusts, dataPoint.wind.gusts);
        totalPrecipitation += dataPoint.precipitation;

        // Count calm morning hours (before 8am, wind < 5 km/h)
        const hour = dataPoint.timestamp.getHours();
        if (hour < 8 && dataPoint.wind.speed < 5) {
            calmMorningHours += 1; // Each data point is 1 hour in Open-Meteo
        }
    }

    // Calculate overall condition
    const overallCondition = evaluateCondition(maxWindSpeed, maxGusts, totalPrecipitation);

    // Detect wind change time
    const windChangeTime = detectWindChangeTime(pointCData);

    // Calculate time windows
    const { bestDepartureWindow, suggestedReturnWindow, dangerWindows } = calculateTimeWindows(
        date,
        pointCData,
        maxWindSpeed,
        calmMorningHours
    );

    return {
        date,
        overallCondition,
        bestDepartureWindow,
        suggestedReturnWindow,
        dangerWindows,
        windChangeTime,
        points,
        summary: {
            maxWindSpeed: Math.round(maxWindSpeed * 10) / 10,
            maxGusts: Math.round(maxGusts * 10) / 10,
            totalPrecipitation: Math.round(totalPrecipitation * 10) / 10,
            calmMorningHours: Math.round(calmMorningHours * 10) / 10,
        },
    };
}

/**
 * Transforms parsed Open-Meteo data into FishingForecastData
 */
export function transformToFishingForecast(
    parsedData: ParsedWeatherData,
    days: number = 14
): FishingForecastData {
    // Convert all locations to our format
    const bayPoints = parsedData.locations.map(convertToBayPointWeather);

    // Group each point's data by day
    const pointDataByDay = new Map<string, Map<string, WeatherDataPoint[]>>();

    for (const point of bayPoints) {
        const grouped = groupDataByDay(point.data);

        for (const [dateKey, dayData] of grouped) {
            if (!pointDataByDay.has(dateKey)) {
                pointDataByDay.set(dateKey, new Map());
            }
            pointDataByDay.get(dateKey)!.set(point.pointId, dayData);
        }
    }

    // Create forecasts for each day
    const forecasts: DayForecast[] = [];
    const sortedDates = Array.from(pointDataByDay.keys()).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    for (const dateKey of sortedDates.slice(0, days)) {
        const date = new Date(dateKey);
        const pointsData = pointDataByDay.get(dateKey)!;
        forecasts.push(createDayForecast(date, pointsData));
    }

    return {
        generatedAt: parsedData.fetchedAt,
        forecasts,
    };
}

// ============================================================================
// Main Fetch Function
// ============================================================================

/**
 * Fetches real weather data from Open-Meteo and transforms it into fishing forecast format
 */
export async function getFishingForecast(days: number = 14): Promise<FishingForecastData> {
    // Fetch from Open-Meteo (max 16 days)
    const forecastDays = Math.min(days, 16);
    const rawData = await fetchOpenMeteoForecast(forecastDays);
    const parsedData = parseOpenMeteoResponse(rawData);

    // Transform to fishing forecast format
    return transformToFishingForecast(parsedData, days);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getWeatherForTimeRange(
    forecast: DayForecast,
    startHour: number,
    endHour: number
): { point: BayPointWeather; data: WeatherDataPoint[] }[] {
    return forecast.points.map((point) => ({
        point,
        data: point.data.filter((d) => {
            const hour = d.timestamp.getHours();
            return hour >= startHour && hour < endHour;
        }),
    }));
}
