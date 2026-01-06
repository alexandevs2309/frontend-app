export interface EmployeeDto {
  id: number;
  user_id: number;
  specialty?: string;
  phone?: string;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeWithUserDto {
  id: number;
  user_id: number;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    tenant: number;
    created_at: string;
    updated_at: string;
  };
  specialty?: string;
  phone?: string;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  display_name?: string;
}

export interface CreateEmployeeDto {
  user_id: number;
  specialty?: string;
  phone?: string;
  hire_date?: string;
  is_active?: boolean;
}

export interface UpdateEmployeeDto {
  specialty?: string;
  phone?: string;
  hire_date?: string;
  is_active?: boolean;
}