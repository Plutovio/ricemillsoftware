import apiClient from './client';
import type { BankGuarantee, BankGuaranteeFormData, BankGuaranteeFilters, PaginatedResponse } from '../types/bankGuarantee';

export const bankGuaranteeApi = {
  fetchAll: (filters?: BankGuaranteeFilters & { page?: number; page_size?: number; ordering?: string }) => {
    const params = { ...filters };
    // Remove empty string values
    Object.keys(params).forEach(key => {
      const k = key as keyof typeof params;
      if (params[k] === '' || params[k] === undefined) {
        delete params[k];
      }
    });
    return apiClient.get<PaginatedResponse<BankGuarantee>>('/bank-guarantee/', { params });
  },

  create: (data: BankGuaranteeFormData) =>
    apiClient.post<BankGuarantee>('/bank-guarantee/', data),

  update: (id: number, data: Partial<BankGuaranteeFormData>) =>
    apiClient.put<BankGuarantee>(`/bank-guarantee/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/bank-guarantee/${id}/`),

  importFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/bank-guarantee/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportFile: (filters?: BankGuaranteeFilters) => {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      const k = key as keyof typeof params;
      if (params[k] === '' || params[k] === undefined) {
        delete params[k];
      }
    });
    return apiClient.get('/bank-guarantee/export/', {
      params,
      responseType: 'blob',
    });
  },

  fetchExpiringSoon: () =>
    apiClient.get<BankGuarantee[]>('/bank-guarantee/expiring-soon/'),
};
