// Subcategory interface
export interface Subcategoria {
  subcategoriaId: number;
  nombre: string;
  descripcion: string;
  fechaHora: string | null;
  proximo: boolean;
  categoriaId: number;
  categoriaNombre: string;
  estado?: boolean;
  deporte?: string;
  ubicacion?: string;
}

// Request interfaces
export interface CreateSubcategoriaRequest {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  fechaHora?: string;
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
