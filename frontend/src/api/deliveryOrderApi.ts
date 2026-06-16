import apiClient from './client';
import type { DeliveryOrder, DeliveryOrderFormData, DeliveryOrderFilters } from '../types/deliveryOrder';
import type { PaginatedResponse } from '../types/bankGuarantee';

export const deliveryOrderApi = {
  fetchAll: (filters?: DeliveryOrderFilters & { page?: number; page_size?: number; ordering?: string }) => {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      const k = key as keyof typeof params;
      if (params[k] === '' || params[k] === undefined) {
        delete params[k];
      }
    });
    // The default pagination in settings.py is PageNumberPagination with page_size=25.
    // If we want all DOs without pagination (e.g. for dropdown lists), we can check.
    // However, DRF ViewSets will paginate by default unless we pass query params or disable it.
    // Let's call it and expect a PaginatedResponse. If needed, we can support pagination or fetch all pages.
    return apiClient.get<PaginatedResponse<DeliveryOrder>>('/delivery-orders/', { params });
  },

  create: (data: DeliveryOrderFormData) =>
    apiClient.post<DeliveryOrder>('/delivery-orders/', data),

  update: (id: number, data: Partial<DeliveryOrderFormData>) =>
    apiClient.put<DeliveryOrder>(`/delivery-orders/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/delivery-orders/${id}/`),

  fetchAggregateBgQuantity: () =>
    apiClient.get<{ aggregate_bg_quantity: number }>('/delivery-orders/aggregate-bg-quantity/'),
};
