export interface TablaPosicion {
  subcategoriaId: number;
  equipoId: number;
  equipoNombre: string;
  partidosJugados: number;
  victorias: number;
  derrotas: number;
  empates: number;
  puntos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
  posicion: number;
  serieId: number;
  serieNombre: string;
  categoriaId: number;
  categoriaNombre: string;
}

export interface TablaPosicionRequest {
  subcategoriaId: number;
  equipoId: number;
  partidosJugados: number;
  victorias: number;
  derrotas: number;
  empates: number;
  puntos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
}

export interface TablaPosicionResponse {
  success: boolean;
  message: string;
  data: TablaPosicion[];
  timestamp: string;
}

export interface ActualizarDesdePartidoRequest {
  subcategoriaId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  golesLocal: number;
  golesVisitante: number;
  estadoPartido: string;
}

export interface SearchParams {
  subcategoriaId?: number;
  categoriaId?: number;
  equipoId?: number;
  serieId?: number;
  nombreEquipo?: string;
  page?: number;
  size?: number;
  sort?: string;
}
