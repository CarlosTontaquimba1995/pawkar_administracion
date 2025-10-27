export interface Role {
  id: number;
  name: string;
  detail: string;
  estado: boolean;
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: Role;
}

export interface RoleListResponse {
  success: boolean;
  message: string;
  data: Role[];
}

export interface CreateRoleRequest {
  name: string;
  detail: string;
}

export interface BulkCreateRolesRequest {
  roles: CreateRoleRequest[];
}

export interface BulkCreateRolesResponse {
  success: boolean;
  message: string;
  data: Role[];
}


export interface DeleteRoleResponse {
  success: boolean;
  message: string;
  data: null;
  timestamp: string;
}

export interface UpdateRoleRequest {
  name?: string;
  detail?: string;
}

