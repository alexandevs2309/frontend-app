export interface ServiceCategoryDto {
  id: number;
  name: string;
}

export interface ServiceDto {
  id: number;
  name: string;
  description?: string;
  categories: number[]; // ✅ Normalizado desde backend (array de IDs)
  category_names?: string[]; // ✅ Campo derivado para UI
  price: number;
  duration: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  categories: number[]; // ✅ Backend field name
  price: number;
  duration: number;
  is_active: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  categories?: number[]; // ✅ Backend field name
  price?: number;
  duration?: number;
  is_active?: boolean;
}