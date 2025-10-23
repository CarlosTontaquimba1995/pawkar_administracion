// Base player interface
export interface Player {
    id?: number;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    documentoIdentidad: string;
    equipoId?: number;
    jugadorId?: number;
    numeroCamiseta?: number;
    rolId?: number;
}

// Request/Response interfaces
export interface PlayerResponse {
    success: boolean;
    message: string;
    data: Player;
    timestamp: string;
}

export interface PlayerListResponse {
    success: boolean;
    message: string;
    data: {
        content: Player[];
        totalPages: number;
        totalElements: number;
        size: number;
        number: number;
    };
    timestamp: string;
}

export interface PlayerCountResponse {
    success: boolean;
    message: string;
    data: {
        total: number;
    };
    timestamp: string;
}

export interface CreatePlayerRequest {
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    documentoIdentidad: string;
    activo?: boolean;
}

export interface UpdatePlayerRequest extends Partial<CreatePlayerRequest> { }

export interface CreateMultiplePlayersRequest {
    jugadores: CreatePlayerRequest[];
}

export interface PlayerQueryParams {
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
}
