export interface Ship {
    id: string;
    name: string;
    imo: string; // International Maritime Organization number
    type: ShipType;
    flag: string; // Country code
    flagName: string;
    length: number; // meters
    beam: number; // width in meters
    draft: number; // meters
    grossTonnage: number;
    arrivalDate: string; // ISO date string
    status: ShipStatus;
    anchoragePosition?: {
        latitude: number;
        longitude: number;
    };
    origin?: string;
    destination?: string;
    cargo?: string;
    agent?: string;
    eta?: string; // Expected time of arrival at berth
}

export type ShipType =
    | "bulk_carrier"
    | "container"
    | "tanker"
    | "general_cargo"
    | "ro_ro"
    | "passenger"
    | "fishing"
    | "tug"
    | "other";

export type ShipStatus =
    | "anchored"
    | "waiting_berth"
    | "loading"
    | "unloading"
    | "departing"
    | "arriving";

export interface ShipListResponse {
    ships: Ship[];
    totalCount: number;
    lastUpdated: string;
}

// Ship type labels in Portuguese
export const shipTypeLabels: Record<ShipType, string> = {
    bulk_carrier: "Graneleiro",
    container: "Porta-contêiner",
    tanker: "Navio-tanque",
    general_cargo: "Carga Geral",
    ro_ro: "Ro-Ro",
    passenger: "Passageiros",
    fishing: "Pesqueiro",
    tug: "Rebocador",
    other: "Outro",
};

// Ship status labels in Portuguese
export const shipStatusLabels: Record<ShipStatus, string> = {
    anchored: "Fundeado",
    waiting_berth: "Aguardando Berço",
    loading: "Carregando",
    unloading: "Descarregando",
    departing: "Partindo",
    arriving: "Chegando",
};

// Status colors for UI
export const shipStatusColors: Record<ShipStatus, string> = {
    anchored: "blue",
    waiting_berth: "orange",
    loading: "green",
    unloading: "cyan",
    departing: "purple",
    arriving: "gold",
};

// Ship type icons (emoji for mock)
export const shipTypeIcons: Record<ShipType, string> = {
    bulk_carrier: "🚢",
    container: "📦",
    tanker: "🛢️",
    general_cargo: "📤",
    ro_ro: "🚗",
    passenger: "🛳️",
    fishing: "🎣",
    tug: "⚓",
    other: "🚢",
};

// Mock data for ships anchored in the bay
const mockShips: Ship[] = [
    {
        id: "1",
        name: "ATLANTIC SPIRIT",
        imo: "9876543",
        type: "bulk_carrier",
        flag: "LR",
        flagName: "Libéria",
        length: 229,
        beam: 32.2,
        draft: 14.5,
        grossTonnage: 43250,
        arrivalDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: "anchored",
        anchoragePosition: { latitude: -27.5842, longitude: -48.5156 },
        origin: "Santos, BR",
        destination: "Itajaí, BR",
        cargo: "Soja",
        agent: "Wilson Sons",
    },
    {
        id: "2",
        name: "NORDIC STAR",
        imo: "9654321",
        type: "container",
        flag: "PA",
        flagName: "Panamá",
        length: 294,
        beam: 32.3,
        draft: 12.8,
        grossTonnage: 54150,
        arrivalDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "waiting_berth",
        anchoragePosition: { latitude: -27.5912, longitude: -48.5089 },
        origin: "Hamburgo, DE",
        destination: "Itajaí, BR",
        cargo: "Contêineres Diversos",
        agent: "Maersk Line",
        eta: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "3",
        name: "OCEAN VOYAGER",
        imo: "9123456",
        type: "tanker",
        flag: "MH",
        flagName: "Ilhas Marshall",
        length: 183,
        beam: 27.4,
        draft: 10.2,
        grossTonnage: 28900,
        arrivalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "anchored",
        anchoragePosition: { latitude: -27.5780, longitude: -48.5210 },
        origin: "Rotterdam, NL",
        cargo: "Óleo Diesel",
        agent: "Intertanker",
    },
    {
        id: "4",
        name: "CAPRI EXPRESS",
        imo: "9567890",
        type: "general_cargo",
        flag: "BS",
        flagName: "Bahamas",
        length: 156,
        beam: 23.5,
        draft: 8.7,
        grossTonnage: 15200,
        arrivalDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: "arriving",
        origin: "Buenos Aires, AR",
        destination: "Itajaí, BR",
        cargo: "Máquinas Agrícolas",
        agent: "Hamburg Süd",
    },
    {
        id: "5",
        name: "PACIFIC BREEZE",
        imo: "9234567",
        type: "bulk_carrier",
        flag: "SG",
        flagName: "Singapura",
        length: 199,
        beam: 32.3,
        draft: 13.1,
        grossTonnage: 37800,
        arrivalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "loading",
        origin: "Hong Kong, HK",
        destination: "Santos, BR",
        cargo: "Milho",
        agent: "Cargill",
    },
    {
        id: "6",
        name: "EMERALD SEA",
        imo: "9345678",
        type: "ro_ro",
        flag: "NO",
        flagName: "Noruega",
        length: 200,
        beam: 32.2,
        draft: 9.8,
        grossTonnage: 41200,
        arrivalDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: "waiting_berth",
        anchoragePosition: { latitude: -27.5856, longitude: -48.5134 },
        origin: "Bremerhaven, DE",
        cargo: "Veículos",
        agent: "Wallenius Wilhelmsen",
        eta: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "7",
        name: "SOUTHERN CROSS",
        imo: "9456789",
        type: "container",
        flag: "HK",
        flagName: "Hong Kong",
        length: 334,
        beam: 42.8,
        draft: 14.5,
        grossTonnage: 95000,
        arrivalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "unloading",
        origin: "Xangai, CN",
        destination: "Itajaí, BR",
        cargo: "Contêineres - Eletrônicos",
        agent: "COSCO",
    },
];

/**
 * Mock function to fetch ships anchored in the bay
 * Simulates API delay for realistic behavior
 */
export async function fetchAnchoredShips(): Promise<ShipListResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return mock data
    return {
        ships: mockShips,
        totalCount: mockShips.length,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Calculate how long a ship has been anchored
 */
export function calculateAnchorTime(arrivalDate: string): {
    days: number;
    hours: number;
    minutes: number;
    totalHours: number;
} {
    const arrival = new Date(arrivalDate);
    const now = new Date();
    const diffMs = now.getTime() - arrival.getTime();

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;

    return { days, hours, minutes, totalHours };
}

/**
 * Format anchor time as readable string
 */
export function formatAnchorTime(arrivalDate: string): string {
    const { days, hours, minutes } = calculateAnchorTime(arrivalDate);

    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}
