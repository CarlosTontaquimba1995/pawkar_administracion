import { Role } from "./role.types";

export interface SubcategoriaRol {
  subcategoriaId: number;
  rolId: number;
  nombreSubcategoria?: string;
  nombreRol?: string;
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

export interface BulkAsignarRolesRequest {
  subcategoriaId: number;
  rolesIds: number[];
}

export interface BulkAsignarRolesResponse {
  success: boolean;
  message: string;
  data: {
    subcategoriaId: number;
    rolesAsignados: Role[];
  };
}

export interface EliminarRolResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface ObtenerRolesResponse {
  success: boolean;
  message: string;
  data: Role[];
}
