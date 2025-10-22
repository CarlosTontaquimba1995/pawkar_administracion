// Subcategory interface
export interface Subcategoria {
  subcategoriaId: number;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
}

// Request interfaces
export interface CreateSubcategoriaRequest {
  nombre: string;
  descripcion: string;
  categoriaId: number;
}

export interface CreateMultipleSubcategoriasRequest {
  subcategorias: Array<CreateSubcategoriaRequest>;
}

export interface UpdateSubcategoriaRequest extends Partial<CreateSubcategoriaRequest> {}

// Response interfaces
export interface SubcategoriaResponse {
  success: boolean;
  message: string;
  data: Subcategoria;
  timestamp: string;
}

export interface SubcategoriaListResponse {
  success: boolean;
  message: string;
  data: Subcategoria[];
  timestamp: string;
}

export interface DeleteSubcategoriaResponse {
  success: boolean;
  message: string;
  data: null;
  timestamp: string;
}
