// Role type
export interface Role {
  id: number;
  name: string;
}

// User type
export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
  enabled?: boolean;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
}

// Response types
export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: User[];
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
  };
}

// Request types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleIds: number[];
}

export interface UpdateUserRequest {
  id: number;
  username?: string;
  email?: string;
  password?: string;
  roleIds?: number[];
  enabled?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface UserQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  enabled?: boolean;
}
