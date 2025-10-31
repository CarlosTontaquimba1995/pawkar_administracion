/**
 * Tipos relacionados con la generación de encuentros
 */

export interface EncuentroGenerado {
  id: number;
  titulo: string;
  fechaHora: string;
  estadioLugar: string;
  estado: string;
  subcategoriaId: number;
  subcategoriaNombre: string;
}

export interface EncuentroManual {
  equipoLocalId: number;
  equipoVisitanteId: number;
  fecha: string;
  hora: string;
  estadioId: number;
}

export interface GenerarEncuentrosRequest {
  subcategoriaId: number;
  tipoGeneracion: 'SELECCION_MANUAL' | 'AUTOMATICO' | 'POR_GRUPOS';
  encuentrosManuales?: EncuentroManual[];
  // Agregar otros parámetros de generación automática si es necesario
}

export interface GenerarEncuentrosResponse {
  success: boolean;
  message: string;
  data: EncuentroGenerado[];
  timestamp: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  timestamp: string;
}
