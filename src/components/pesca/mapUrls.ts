// Helper functions for generating map URLs

export interface Coordinate {
    lat: number;
    lng: number;
}

/**
 * Generate Ventusky URL for a coordinate
 */
export function getVentuskyUrl(lat: number, lng: number): string {
    return `https://www.ventusky.com/${lat};${lng}`;
}

/**
 * Generate Ventusky URL from a Coordinate object
 */
export function getVentuskyUrlFromCoord(coord: Coordinate): string {
    return getVentuskyUrl(coord.lat, coord.lng);
}

/**
 * Generate Google Maps URL for a single point
 */
export function getGoogleMapsPointUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Generate Google Maps directions URL for multiple points
 * Points will be shown as waypoints in a route
 */
export function getGoogleMapsRouteUrl(points: Coordinate[]): string {
    if (points.length === 0) return "";
    const coords = points.map(p => `${p.lat},${p.lng}`).join("/");
    return `https://www.google.com/maps/dir/${coords}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculate distance between two Coordinate objects
 */
export function calculateDistanceKmFromCoords(coord1: Coordinate, coord2: Coordinate): number {
    return calculateDistanceKm(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
}
