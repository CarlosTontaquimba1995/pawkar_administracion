export interface Team {
  id: number;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  jugadoresCount?: number;
  // Add other team properties as needed
}
