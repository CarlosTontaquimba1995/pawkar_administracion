export type EstadoEncuentro = 'PROGRAMADO' | 'EN_JUEGO' | 'FINALIZADO' | 'SUSPENDIDO' | 'CANCELADO';

export interface Encuentro {
  id?: number;
  fechaHora: string;
  estadioLugar: string;
  estado: EstadoEncuentro;
  subcategoriaId: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  equipoLocalNombre?: string;
  equipoVisitanteNombre?: string;
  subcategoriaNombre?: string;
  titulo?: string;
}

export interface CreateEncuentroRequest {
  equipoLocalId: number,
  equipoVisitanteId: number,
  fecha: string,
  hora: string,
  estadio: string
}

export interface CreateMultipleEncuentrosRequest {
  subcategoriaId: number;
  tipoGeneracion: string;
  encuentrosManuales: CreateEncuentroRequest[];
}

export interface UpdateEncuentroRequest {
  fechaHora?: string;
  estadioLugar?: string;
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
