export interface Sancion {
  sancionId: number;
  tipoSancion: string;
  motivo: string;
  detalleSancion: string;
  fechaRegistro: string;
}

export interface Plantilla {
  equipoId: number;
  equipoNombre: string;
  jugadorId: number;
  jugadorNombreCompleto: string;
  numeroCamiseta: number;
  rolId: number;
  rolNombre: string;
  tieneSancion: boolean;
  sanciones: Sancion[];
}

export interface CreatePlantillaRequest {
  equipoId: number;
  jugadorId: number;
  numeroCamiseta: number;
  rolId: number;
}

export interface CreateMultiplePlantillasRequest {
  jugadores: Array<{
    equipoId: number;
    jugadorId: number;
    numeroCamiseta: number;
    rolId: number;
  }>;
}

export interface PlantillaResponse {
  success: boolean;
  message: string;
  data: Plantilla;
}

export interface PlantillaListResponse {
  success: boolean;
  message: string;
  data: Plantilla[];
}

export interface DeletePlantillaResponse {
  success: boolean;
  message: string;
}
