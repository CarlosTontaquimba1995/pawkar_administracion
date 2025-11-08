// Base sanción interface
export interface Sancion {
  id: number;
  jugadorId: number;
  jugadorNombre: string;
  encuentroId: number;
  encuentroTitulo: string;
  tipoSancion: 'TARJETA_AMARILLA' | 'TARJETA_ROJA' | string;
  motivo: string | null;
  detalleSancion: string | null;
  fechaRegistro: string;
}

// Request/Response interfaces
export interface SancionResponse {
  success: boolean;
  message: string;
  data: Sancion;
  timestamp: string;
}

export interface SancionListResponse {
  success: boolean;
  message: string;
  data: Sancion[];
  timestamp: string;
}

export interface CreateSancionRequest {
  jugadorId: number;
  encuentroId: number;
  tipoSancion: string;
  detalleSancion?: string | null;
  fechaRegistro: string;
}

export interface UpdateSancionRequest extends Partial<CreateSancionRequest> {
  id: number;
}

export interface SancionQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
}
