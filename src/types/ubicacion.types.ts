// Ubicacion interface
export interface Ubicacion {
  id: number;
  descripcion: string;
  nemonico?: string;
  estado: boolean;
  latitud?: number;
  longitud?: number;
  createdAt: string;
  updatedAt: string;
}

// Request interfaces
export interface CreateUbicacionRequest {
  descripcion: string;
  nemonico?: string;
  estado?: boolean;
  latitud?: number;
  longitud?: number;
}

export interface UpdateUbicacionRequest extends Partial<CreateUbicacionRequest> {}

// Response interfaces
export interface UbicacionResponse {
  success: boolean;
  message: string;
  data: Ubicacion;
  timestamp: string;
}

export interface UbicacionListResponse {
  success: boolean;
  message: string;
  data: Ubicacion[];
  timestamp: string;
}

export interface DeleteUbicacionResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
