// Types for Categoria

export interface Categoria {
  categoriaId: number;
  nombre: string;
  nemonico?: string;
  estado?: boolean;
}

export interface CategoriaListResponse {
  success: boolean;
  message: string;
  data: Categoria[];
  timestamp: string;
}

export interface CategoriaResponse {
  success: boolean;
  message: string;
  data: Categoria | null;
  timestamp: string;
}

export interface CreateCategoriaRequest {
  nombre: string;
}

export interface CreateMultipleCategoriasRequest {
  categorias: CreateCategoriaRequest[];
}

export interface UpdateCategoriaRequest {
  nombre: string;
}

export interface DeleteCategoriaResponse {
  success: boolean;
  message: string;
  data: null;
  timestamp: string;
}
