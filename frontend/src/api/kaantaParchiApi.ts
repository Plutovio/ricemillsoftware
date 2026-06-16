import apiClient from './client';
import type { KaantaParchi, KaantaParchiFormData, KaantaParchiFilters } from '../types/deliveryOrder';
import type { PaginatedResponse } from '../types/bankGuarantee';

export const kaantaParchiApi = {
  fetchAll: (filters?: KaantaParchiFilters & { page?: number; page_size?: number; ordering?: string }) => {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      const k = key as keyof typeof params;
      if (params[k] === '' || params[k] === undefined) {
        delete params[k];
      }
    });
    return apiClient.get<PaginatedResponse<KaantaParchi>>('/kaanta-parchi/', { params });
  },

  create: (data: KaantaParchiFormData) =>
    apiClient.post<KaantaParchi>('/kaanta-parchi/', data),

  update: (id: number, data: Partial<KaantaParchiFormData>) =>
    apiClient.put<KaantaParchi>(`/kaanta-parchi/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/kaanta-parchi/${id}/`),

  importFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/kaanta-parchi/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportFile: (filters?: KaantaParchiFilters) => {
    const params = { ...filters };
    Object.keys(params).forEach(key => {
      const k = key as keyof typeof params;
      if (params[k] === '' || params[k] === undefined) {
        delete params[k];
      }
    });
    return apiClient.get('/kaanta-parchi/export/', {
      params,
      responseType: 'blob',
    });
  },
};
