import { Artista } from './artista.types';

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
  ubicacion: string;
  latitud: number;
  longitud: number;
  artistas: Artista[];
}

// Request interfaces
export interface CreateSubcategoriaRequest {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  fechaHora: string;
  latitud: number;
  longitud: number;
  ubicacion: string;
  artistas: Artista[];
}

export interface CreateMultipleSubcategoriasRequest {
  subcategorias: Array<Omit<Subcategoria, 'subcategoriaId' | 'categoriaNombre' | 'estado' | 'deporte'>>;
}

export interface UpdateSubcategoriaRequest {
  nombre?: string;
  descripcion?: string;
  categoriaId?: number;
  fechaHora?: string;
  latitud?: number;
  longitud?: number;
  ubicacion?: string;
  artistas?: Artista[];
}

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
