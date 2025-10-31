/**
 * Tipos relacionados con los estadios
 */

export interface Estadio {
    id?: number;
    nombre: string;
    detalle: string;
    estado?: boolean;
}

export interface CreateEstadioRequest {
    nombre: string;
    detalle: string;
    estado?: boolean;
}

export interface UpdateEstadioRequest extends Partial<CreateEstadioRequest> { }

export interface CreateBulkEstadiosRequest {
    estadios: CreateEstadioRequest[];
}

export interface EstadioResponse {
    success: boolean;
    message: string;
    data: Estadio | Estadio[] | null;
    timestamp?: string;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
    error?: string;
    timestamp?: string;
}
