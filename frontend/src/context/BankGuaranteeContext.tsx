import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { bankGuaranteeApi } from '../api/bankGuaranteeApi';
import type { BankGuarantee, BankGuaranteeFilters, BankGuaranteeFormData, QuantityUnit } from '../types/bankGuarantee';
import { useAuth } from './AuthContext';

interface BankGuaranteeContextType {
  records: BankGuarantee[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  activeFilters: BankGuaranteeFilters;
  selectedYear: number | 'all';
  availableYears: (number | 'all')[];
  expiringSoonRecords: BankGuarantee[];
  quantityUnit: QuantityUnit;
  currentPage: number;
  pageSize: number;
  ordering: string;
  fetchRecords: () => Promise<void>;
  createRecord: (data: BankGuaranteeFormData) => Promise<void>;
  updateRecord: (id: number, data: Partial<BankGuaranteeFormData>) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  setFilters: (filters: BankGuaranteeFilters) => void;
  clearFilters: () => void;
  setYear: (year: number | 'all') => void;
  addYear: (year: number) => void;
  toggleUnit: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setOrdering: (ordering: string) => void;
  importRecords: (file: File) => Promise<{ imported: number; errors: unknown[] }>;
  exportRecords: () => Promise<void>;
  fetchExpiringSoon: () => Promise<void>;
}

const BankGuaranteeContext = createContext<BankGuaranteeContextType | undefined>(undefined);

export function BankGuaranteeProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState<BankGuarantee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<BankGuaranteeFilters>({});
  const [availableYears, setAvailableYears] = useState<(number | 'all')[]>(() => {
    const saved = localStorage.getItem('available_years');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return ['all', 2027, 2026, 2025, 2024];
  });
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() => {
    const saved = localStorage.getItem('selected_year');
    if (saved) {
      if (saved === 'all') return 'all';
      const num = parseInt(saved);
      if (!isNaN(num)) return num;
    }
    return new Date().getFullYear();
  });
  const [expiringSoonRecords, setExpiringSoonRecords] = useState<BankGuarantee[]>([]);
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(() => {
    return (localStorage.getItem('quantity_unit') as QuantityUnit) || 'kg';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [ordering, setOrdering] = useState('-issue_date');

  const fetchExpiringSoon = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await bankGuaranteeApi.fetchExpiringSoon();
      setExpiringSoonRecords(response.data);
    } catch {
      // Silently fail for notifications
    }
  }, [isAuthenticated]);

  const fetchRecords = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await bankGuaranteeApi.fetchAll({
        ...activeFilters,
        year: selectedYear,
        page: currentPage,
        page_size: pageSize,
        ordering,
      });
      setRecords(response.data.results);
      setTotalCount(response.data.count);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeFilters, selectedYear, currentPage, pageSize, ordering]);

  const createRecord = useCallback(async (data: BankGuaranteeFormData) => {
    setLoading(true);
    try {
      await bankGuaranteeApi.create(data);
      await fetchRecords();
      await fetchExpiringSoon();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { bg_number?: string[]; detail?: string } } };
      const message = axiosErr.response?.data?.bg_number?.[0] || axiosErr.response?.data?.detail || 'Failed to create record';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchRecords, fetchExpiringSoon]);

  const updateRecord = useCallback(async (id: number, data: Partial<BankGuaranteeFormData>) => {
    setLoading(true);
    try {
      await bankGuaranteeApi.update(id, data);
      await fetchRecords();
      await fetchExpiringSoon();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      throw new Error(axiosErr.response?.data?.detail || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  }, [fetchRecords, fetchExpiringSoon]);

  const deleteRecord = useCallback(async (id: number) => {
    try {
      await bankGuaranteeApi.delete(id);
      await fetchRecords();
      await fetchExpiringSoon();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      throw new Error(axiosErr.response?.data?.detail || 'Failed to delete record');
    }
  }, [fetchRecords, fetchExpiringSoon]);

  const setFilters = useCallback((filters: BankGuaranteeFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setCurrentPage(1);
  }, []);

  const setYear = useCallback((year: number | 'all') => {
    setSelectedYear(year);
    localStorage.setItem('selected_year', String(year));
    setCurrentPage(1);
  }, []);

  const addYear = useCallback((year: number) => {
    setAvailableYears(prev => {
      if (prev.includes(year)) return prev;
      const nums = prev.filter((y): y is number => typeof y === 'number');
      const nextNums = [...nums, year].sort((a, b) => b - a);
      const next: (number | 'all')[] = ['all', ...nextNums];
      localStorage.setItem('available_years', JSON.stringify(next));
      return next;
    });
    setYear(year);
  }, [setYear]);

  const toggleUnit = useCallback(() => {
    setQuantityUnit(prev => {
      const next = prev === 'kg' ? 'quintal' : 'kg';
      localStorage.setItem('quantity_unit', next);
      return next;
    });
  }, []);

  const importRecords = useCallback(async (file: File) => {
    const response = await bankGuaranteeApi.importFile(file);
    await fetchRecords();
    return response.data;
  }, [fetchRecords]);

  const exportRecords = useCallback(async () => {
    const response = await bankGuaranteeApi.exportFile({
      ...activeFilters,
      year: selectedYear,
    });
    // Download the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bank_guarantees.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, [activeFilters, selectedYear]);



  // Auto-fetch on filter/year/page changes
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Fetch expiring soon on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchExpiringSoon();
    }
  }, [isAuthenticated, fetchExpiringSoon]);

  return (
    <BankGuaranteeContext.Provider value={{
      records, totalCount, loading, error,
      activeFilters, selectedYear, availableYears, expiringSoonRecords,
      quantityUnit, currentPage, pageSize, ordering,
      fetchRecords, createRecord, updateRecord, deleteRecord,
      setFilters, clearFilters, setYear, addYear, toggleUnit,
      setCurrentPage, setPageSize, setOrdering,
      importRecords, exportRecords, fetchExpiringSoon,
    }}>
      {children}
    </BankGuaranteeContext.Provider>
  );
}

export function useBankGuarantee() {
  const context = useContext(BankGuaranteeContext);
  if (!context) throw new Error('useBankGuarantee must be used within BankGuaranteeProvider');
  return context;
}
