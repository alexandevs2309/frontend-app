export interface Period {
  id: number;
  employee_name: string;
  period_display: string;
  status: 'open' | 'ready' | 'paid';
  gross_amount: number;
  net_amount: number;
  deductions_total: number;
  period_start: string;
  period_end: string;
}

export interface PaymentRequest {
  period_id: number;
  payment_method: 'cash' | 'transfer';
  payment_reference?: string;
}

export interface PaymentResponse {
  payment_id: string;
  message: string;
  amount_paid: number;
  paid_at: string;
}