// Base Team interface
export interface Team {
  equipoId: number;
  subcategoriaId: number;
  subcategoriaNombre: string;
  serieId: number;
  serieNombre: string;
  nombre: string;
  fundacion: string;
  jugadoresCount: number;
  estado: string;
}

// Request interfaces
export interface CreateTeamRequest {
  subcategoriaId: number;
  serieId: number;
  nombre: string;
  estado?: 'activo' | 'inactivo';
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> { }

export interface CreateMultipleTeamsRequest {
  equipos: Array<CreateTeamRequest>;
}

// Response interfaces
export interface TeamResponse {
  success: boolean;
  message: string;
  data: Team;
  timestamp: string;
}

export interface TeamListResponse {
  success: boolean;
  message: string;
  data: {
    content: Team[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
  timestamp: string;
}

export interface TeamCountResponse {
  success: boolean;
  message: string;
  data: {
    totalEquipos: number;
    porSubcategoria: Array<{
      subcategoriaId: number;
      subcategoriaNombre: string;
      total: number;
    }>;
  };
  timestamp: string;
}

export interface TeamExistsResponse {
  success: boolean;
  message: string;
  data: boolean;
  timestamp: string;
}

// Query parameter interfaces
export interface TeamQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  nombre?: string;
  search?: string;
}

export interface TeamBySubcategoryParams extends TeamQueryParams {
  serieId?: number;
}
