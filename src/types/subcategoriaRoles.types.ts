export interface SubcategoriaRol {
  rolId: number;
  rolName: string;
  rolDetail: string;
  subcategoriaId: number;
  subcategoriaName: string;
}

export interface AsignarRolResponse {
  success: boolean;
  message: string;
  data: {
    rolId: number;
    rolName: string;
    rolDetail: string;
    subcategoriaId: number;
    subcategoriaName: string;
  };
}

export interface SubcategoriaRequest {
  categoriaId: number;
  nombre: string;
  descripcion: string;
}

export interface SubcategoriaResponse {
  subcategoriaId: number;
  categoriaId: number;
  categoriaNombre: string;
  nombre: string;
  descripcion: string;
}

export interface BulkCreateSubcategoriasRequest {
  subcategorias: SubcategoriaRequest[];
}

export interface BulkCreateSubcategoriasResponse {
  success: boolean;
  message: string;
  data: SubcategoriaResponse[];
}

export interface EliminarRolResponse {
  success: boolean;
  message: string;
  data: {
    rolId: number;
    rolName: string;
    rolDetail: string;
    subcategoriaId: number;
    subcategoriaName: string;
  };
}

export interface ObtenerRolesPorSubcategoriaResponse {
  success: boolean;
  message: string;
  data: SubcategoriaRol[];
}
