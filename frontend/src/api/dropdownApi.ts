import apiClient from './client';
import type { DropdownOption, DropdownCategory } from '../types/dropdown';

export const dropdownApi = {
  fetchOptions: (category: DropdownCategory) =>
    apiClient.get<DropdownOption[]>('/dropdowns/', { params: { category } }),

  addOption: (data: { category: DropdownCategory; value: string; meta?: Record<string, string> }) =>
    apiClient.post<DropdownOption>('/dropdowns/', data),

  deleteOption: (id: number) =>
    apiClient.delete(`/dropdowns/${id}/`),
};
