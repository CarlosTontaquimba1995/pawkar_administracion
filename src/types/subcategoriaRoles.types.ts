export interface SubcategoriaRol {
  id?: number;
  rolId: number;
  rolName?: string;
  rolDetail?: string;
  subcategoriaId: number;
  subcategoriaName?: string;
  nombre?: string; // For compatibility with different response formats
}

export interface AsignarRolResponse {
  success: boolean;
  message: string;
  data: {
    subcategoriaId: number;
    rolId: number;
    nombreSubcategoria: string;
    nombreRol: string;
  };
}

export interface SubcategoriaRoleRequest {
  subcategoriaId: number;
  rolId: number;
}

export interface BulkAsignarRolesRequest {
  subcategoriaId: number;
  roles: number[];
}

export interface BulkAsignarRolesResponse {
  success: boolean;
  message: string;
  data: {
    subcategoriaId: number;
    rolesAsignados: Array<{
      id: number;
      nombre: string;
    }>;
  };
}

export interface ObtenerRolesPorSubcategoriaResponse {
  success: boolean;
  message: string;
  data: Array<{
    id?: number;
    rolId: number;
    rolName?: string;
    rolDetail?: string;
    subcategoriaId: number;
    subcategoriaName?: string;
    nombre?: string; // For compatibility with different response formats
  }>;
}

export interface EliminarRolResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface RolAsignado {
  id: number;
  nombre: string;
}

export interface ActualizarRelacionRequest {
  subcategoriaId: number;
  rolId: number;
}

export interface ActualizarRelacionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    subcategoriaId: number;
    rolId: number;
  };
}
