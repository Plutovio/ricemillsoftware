export interface BankGuarantee {
  id: number;
  bank_name: string;
  branch_name: string;
  ifsc_code: string;
  account_no: string;
  department: string;
  bg_number: string;
  amount_of_bg: string; // Decimal from backend comes as string
  issue_date: string;
  expiry_date: string;
  cheque_number: string | null;
  date_of_issue_of_cheque: string | null;
  bank_name_of_cheque: string | null;
  account_no_of_cheque: string | null;
  // Computed fields (read-only from API)
  no_of_days: number;
  pdc: string;
  total_amount: string;
  quantity: number;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface BankGuaranteeFormData {
  bank_name: string;
  branch_name: string;
  ifsc_code: string;
  account_no: string;
  department: string;
  bg_number: string;
  amount_of_bg: string;
  issue_date: string;
  expiry_date: string;
  cheque_number: string;
  date_of_issue_of_cheque: string;
  bank_name_of_cheque: string;
  account_no_of_cheque: string;
}

export interface BankGuaranteeFilters {
  bank_name?: string;
  branch_name?: string;
  account_no?: string;
  department?: string;
  bg_number?: string;
  issue_date_from?: string;
  issue_date_to?: string;
  expiry_date_from?: string;
  expiry_date_to?: string;
  year?: number;
}

export type QuantityUnit = 'kg' | 'quintal';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
