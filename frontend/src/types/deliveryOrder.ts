export interface DeliveryOrder {
  id: number;
  do_number: string;
  do_date: string;
  source: 'NAN' | 'FCI';
  do_quantity_issued: string | number;
  do_location?: string;
  total_quantity: string | number;
  quantity_to_be_milled: string | number;
  remaining_quantity: string | number;
  aggregate_bg_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryOrderFormData {
  do_number: string;
  do_date: string;
  source: 'NAN' | 'FCI';
  do_quantity_issued: number;
  do_location?: string;
}

export interface DeliveryOrderFilters {
  do_number?: string;
  source?: 'NAN' | 'FCI' | '';
  year?: number | 'all';
}

export interface KaantaParchiDOAllocation {
  id?: number;
  delivery_order_id: number;
  delivery_order_number?: string;
  allocated_boras: number;
  allocated_quantity?: string | number;
}

export interface KaantaParchi {
  id: number;
  kaanta_parchi_no: string;
  vehicle_no: string;
  driver_name: string;
  driver_mobile_no: string;
  gate_pass_no: string;
  gate_pass_date: string;
  no_of_boras: number;
  weight_of_boras: string | number;
  weight_of_dhan: string | number;
  weight_of_empty_truck: string | number;
  weight_of_filled_truck: string | number;
  net_weight: string | number;
  do_allocations: KaantaParchiDOAllocation[];
  created_at: string;
  updated_at: string;
}

export interface KaantaParchiFormData {
  kaanta_parchi_no: string;
  vehicle_no: string;
  driver_name: string;
  driver_mobile_no: string;
  gate_pass_no: string;
  gate_pass_date: string;
  no_of_boras: number;
  weight_of_empty_truck: number;
  weight_of_filled_truck: number;
  do_allocations: KaantaParchiDOAllocation[];
}

export interface KaantaParchiFilters {
  kaanta_parchi_no?: string;
  vehicle_no?: string;
  gate_pass_date_from?: string;
  gate_pass_date_to?: string;
  year?: number | 'all';
}
