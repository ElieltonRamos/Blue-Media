export interface User {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'operator';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  username: string;
  password: string;
  role?: 'admin' | 'operator';
}

export interface UpdateUserDto {
  name?: string;
  username?: string;
  role?: 'admin' | 'operator';
  isActive?: boolean;
  password?: string;
}
