/**
 * Role interface representing a user role in the system
 */
export interface Rol {
  /** Unique identifier for the role */
  id: number;
  /** Name of the role */
  name: string;
  /** Detailed description of the role */
  detail: string;
}

/**
 * Interface representing the relationship between a subcategory and a role
 */
export interface SubcategoriaRol {
  /** Unique identifier for the relationship */
  id: number;
  /** The role details */
  rol: Rol;
  /** ID of the subcategory */
  subcategoriaId: number;
}
