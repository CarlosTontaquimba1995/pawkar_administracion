export type EstadoEncuentro = 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO' | 'CANCELADO';

export interface Encuentro {
  id?: number;
  subcategoriaId: number;
  subcategoriaNombre: string;
  titulo: string;
  fechaHora: string;
  estadioNombre: string;
  estadioId: number;
  estado: EstadoEncuentro;
  activo: boolean;
}

export interface CreateEncuentroRequest {
  equipoLocalId: number,
  equipoVisitanteId: number,
  fecha: string,
  hora: string,
  estadioId: number
}

export interface CreateMultipleEncuentrosRequest {
  subcategoriaId: number;
  tipoGeneracion: string;
  encuentrosManuales: CreateEncuentroRequest[];
}

export interface UpdateEncuentroRequest {
  fechaHora?: string;
  estadioId?: number;
  estado?: EstadoEncuentro;
  subcategoriaId?: number;
  equipoLocalId?: number;
  equipoVisitanteId?: number;
}

export interface EncuentroResponse {
  success: boolean;
  message: string;
  data: Encuentro;
}

export interface EncuentroListResponse {
  success: boolean;
  message: string;
  data: Encuentro[];
  timestamp: string;
}

export interface DeleteEncuentroResponse {
  success: boolean;
  message: string;
  data: null;
  timestamp: string;
}

export interface EncuentroPageResponse {
  success: boolean;
  message: string;
  data: {
    content: Encuentro[];
    pageable: {
      sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
      };
      pageNumber: number;
      pageSize: number;
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    numberOfElements: number;
    size: number;
    number: number;
    empty: boolean;
  };
  timestamp: string;
}

export interface EncuentroSearchParams {
  titulo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  subcategoriaId?: number;
  equipoId?: number;
  estadioLugar?: string;
  estado?: string;
  page?: number;
  size?: number;
}
