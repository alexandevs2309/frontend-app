export interface BaseEmployee {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  role: 'stylist' | 'assistant' | 'manager';
  is_active: boolean;
}

export interface EmployeeEarnings extends BaseEmployee {
  payment_type: 'commission' | 'fixed' | 'mixed';
  commission_rate?: number;
  fixed_salary?: number;
  total_earned: number;
  total_sales?: number;
  services_count: number;
  payment_status: 'pending' | 'paid' | 'processing';
}

export interface Period {
  titulo: string;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface CashRegisterState {
  id: number;
  is_open: boolean;
  current_amount: number;
  initial_amount: number;
  opened_at: string;
}