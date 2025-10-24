// Types for Serie

export interface Serie {
    serieId: number;
    subcategoriaId: number;
    subcategoriaNombre: string;
    nombreSerie: string;
    estado: boolean;
}

export interface CreateSerieRequest {
    nombreSerie: string;
    subcategoriaId: number;
}

export interface CreateMultipleSeriesRequest {
    series: CreateSerieRequest[];
}

export interface UpdateSerieRequest {
    nombre?: string;
    descripcion?: string;
    subcategoriaId?: number;
    estado?: boolean;
}

export interface SerieResponse {
    success: boolean;
    message: string;
    data: Serie;
    timestamp: string;
}

export interface SerieListResponse {
    success: boolean;
    message: string;
    data: Serie[];
    timestamp: string;
}

export interface DeleteSerieResponse {
    success: boolean;
    message: string;
    data: null;
    timestamp: string;
}
