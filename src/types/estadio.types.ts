export interface Estadio {
    id: number;
    nombre: string;
    detalle: string;
    estado: boolean;
}

export interface EstadioListResponse {
    success: boolean;
    message: string;
    data: Estadio[];
    timestamp: string;
}

export interface EstadioResponse {
    success: boolean;
    message: string;
    data: Estadio;
    timestamp: string;
}

export interface CreateEstadioRequest {
    nombre: string;
    detalle: string;
    estado?: boolean;
}

export interface UpdateEstadioRequest {
    nombre?: string;
    detalle?: string;
    estado?: boolean;
}

export interface CreateBulkEstadiosRequest {
    estadios: CreateEstadioRequest[];
}

export interface DeleteEstadioResponse {
    success: boolean;
    message: string;
    timestamp: string;
}