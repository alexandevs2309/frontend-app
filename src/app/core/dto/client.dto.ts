export interface ClientDto {
  id: number;
  full_name: string; // ✅ Normalizado desde backend
  email: string;
  phone?: string;
  address?: string;
  birthday?: string; // ✅ Normalizado desde backend (no date_of_birth)
  gender?: 'M' | 'F' | 'O';
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateClientDto {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  birthday?: string; // ✅ Backend field name
  gender?: 'M' | 'F' | 'O';
  notes?: string;
  is_active: boolean;
}

export interface UpdateClientDto {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthday?: string; // ✅ Backend field name
  gender?: 'M' | 'F' | 'O';
  notes?: string;
  is_active?: boolean;
}