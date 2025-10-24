export interface Role {
  rolId: number;
  name: string;
  rolDetail: string;
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
  description: string;
}

export interface BulkCreateRolesRequest {
  roles: CreateRoleRequest[];
}

export interface BulkCreateRolesResponse {
  success: boolean;
  message: string;
  data: Role[];
}
