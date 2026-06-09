export interface DropdownOption {
  id: number;
  category: string;
  value: string;
  meta: Record<string, string> | null;
  created_at: string;
}

export type DropdownCategory = 
  | 'bank_name' 
  | 'branch_name' 
  | 'debit_account_no' 
  | 'department' 
  | 'account_no_of_cheque';
