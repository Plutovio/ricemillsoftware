import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type {
  DeliveryOrder,
  DeliveryOrderFormData,
  DeliveryOrderFilters,
  KaantaParchi,
  KaantaParchiFormData,
  KaantaParchiFilters
} from '../types/deliveryOrder';
import { deliveryOrderApi } from '../api/deliveryOrderApi';
import { kaantaParchiApi } from '../api/kaantaParchiApi';

interface DeliveryOrderContextType {
  deliveryOrders: DeliveryOrder[];
  kaantaParchis: KaantaParchi[];
  doTotalCount: number;
  kpTotalCount: number;
  loading: boolean;
  error: string | null;
  
  doFilters: DeliveryOrderFilters;
  kpFilters: KaantaParchiFilters;
  doSelectedYear: number | 'all';
  kpSelectedYear: number | 'all';
  doAvailableYears: (number | 'all')[];
  kpAvailableYears: (number | 'all')[];
  doPage: number;
  kpPage: number;
  doPageSize: number;
  kpPageSize: number;
  aggregateBgQuantity: number;

  setDoPage: (page: number) => void;
  setKpPage: (page: number) => void;
  setDoPageSize: (size: number) => void;
  setKpPageSize: (size: number) => void;
  
  fetchDOs: () => Promise<void>;
  fetchKPs: () => Promise<void>;
  createDO: (data: DeliveryOrderFormData) => Promise<void>;
  updateDO: (id: number, data: Partial<DeliveryOrderFormData>) => Promise<void>;
  deleteDO: (id: number) => Promise<void>;
  
  createKP: (data: KaantaParchiFormData) => Promise<void>;
  updateKP: (id: number, data: Partial<KaantaParchiFormData>) => Promise<void>;
  deleteKP: (id: number) => Promise<void>;
  
  importKPFile: (file: File) => Promise<{ imported: number; errors: any[] }>;
  exportKPs: () => Promise<void>;
  fetchAggregateBgQuantity: () => Promise<void>;
  
  setDoFilters: (filters: DeliveryOrderFilters) => void;
  setKpFilters: (filters: KaantaParchiFilters) => void;
  clearDoFilters: () => void;
  clearKpFilters: () => void;
  
  setDoYear: (year: number | 'all') => void;
  setKpYear: (year: number | 'all') => void;
  addDoYear: (year: number) => void;
  addKpYear: (year: number) => void;
}

const DeliveryOrderContext = createContext<DeliveryOrderContextType | undefined>(undefined);

export function DeliveryOrderProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [kaantaParchis, setKaantaParchis] = useState<KaantaParchi[]>([]);
  const [doTotalCount, setDoTotalCount] = useState(0);
  const [kpTotalCount, setKpTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [doFilters, setActiveDoFilters] = useState<DeliveryOrderFilters>({});
  const [kpFilters, setActiveKpFilters] = useState<KaantaParchiFilters>({});
  
  const [doPage, setDoPage] = useState(1);
  const [kpPage, setKpPage] = useState(1);
  const [doPageSize, setDoPageSize] = useState(25);
  const [kpPageSize, setKpPageSize] = useState(25);
  const [aggregateBgQuantity, setAggregateBgQuantity] = useState(0);

  const [doAvailableYears, setDoAvailableYears] = useState<(number | 'all')[]>(() => {
    const saved = localStorage.getItem('do_available_years');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return ['all', 2027, 2026, 2025, 2024];
  });

  const [kpAvailableYears, setKpAvailableYears] = useState<(number | 'all')[]>(() => {
    const saved = localStorage.getItem('kp_available_years');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return ['all', 2027, 2026, 2025, 2024];
  });

  const [doSelectedYear, setDoSelectedYear] = useState<number | 'all'>(() => {
    const saved = localStorage.getItem('do_selected_year');
    if (saved) {
      if (saved === 'all') return 'all';
      const num = parseInt(saved);
      if (!isNaN(num)) return num;
    }
    return new Date().getFullYear();
  });

  const [kpSelectedYear, setKpSelectedYear] = useState<number | 'all'>(() => {
    const saved = localStorage.getItem('kp_selected_year');
    if (saved) {
      if (saved === 'all') return 'all';
      const num = parseInt(saved);
      if (!isNaN(num)) return num;
    }
    return new Date().getFullYear();
  });

  const fetchAggregateBgQuantity = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await deliveryOrderApi.fetchAggregateBgQuantity();
      setAggregateBgQuantity(response.data.aggregate_bg_quantity);
    } catch {}
  }, [isAuthenticated]);

  const fetchDOs = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await deliveryOrderApi.fetchAll({
        ...doFilters,
        year: doSelectedYear,
        page: doPage,
        page_size: doPageSize,
      });
      setDeliveryOrders(response.data.results);
      setDoTotalCount(response.data.count);
      
      // Keep BG quantity in sync
      await fetchAggregateBgQuantity();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch Delivery Orders');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, doFilters, doSelectedYear, doPage, doPageSize, fetchAggregateBgQuantity]);

  const fetchKPs = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await kaantaParchiApi.fetchAll({
        ...kpFilters,
        year: kpSelectedYear,
        page: kpPage,
        page_size: kpPageSize,
      });
      setKaantaParchis(response.data.results);
      setKpTotalCount(response.data.count);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch Kaanta Parchis');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, kpFilters, kpSelectedYear, kpPage, kpPageSize]);

  useEffect(() => {
    fetchDOs();
  }, [fetchDOs]);

  useEffect(() => {
    fetchKPs();
  }, [fetchKPs]);

  useEffect(() => {
    fetchAggregateBgQuantity();
  }, [fetchAggregateBgQuantity]);

  const createDO = useCallback(async (data: DeliveryOrderFormData) => {
    setLoading(true);
    try {
      await deliveryOrderApi.create(data);
      await fetchDOs();
    } catch (err: any) {
      const message = err.response?.data?.do_number?.[0] || err.response?.data?.detail || 'Failed to create Delivery Order';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchDOs]);

  const updateDO = useCallback(async (id: number, data: Partial<DeliveryOrderFormData>) => {
    setLoading(true);
    try {
      await deliveryOrderApi.update(id, data);
      await fetchDOs();
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update Delivery Order');
    } finally {
      setLoading(false);
    }
  }, [fetchDOs]);

  const deleteDO = useCallback(async (id: number) => {
    try {
      await deliveryOrderApi.delete(id);
      await fetchDOs();
      await fetchKPs(); // Allocations might be deleted cascadingly
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete Delivery Order');
    }
  }, [fetchDOs, fetchKPs]);

  const createKP = useCallback(async (data: KaantaParchiFormData) => {
    setLoading(true);
    try {
      await kaantaParchiApi.create(data);
      await fetchKPs();
      await fetchDOs(); // DO totals are updated on allocation creation
    } catch (err: any) {
      const message = err.response?.data?.kaanta_parchi_no?.[0] || err.response?.data?.do_allocations?.[0] || err.response?.data?.detail || 'Failed to create Kaanta Parchi';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchKPs, fetchDOs]);

  const updateKP = useCallback(async (id: number, data: Partial<KaantaParchiFormData>) => {
    setLoading(true);
    try {
      await kaantaParchiApi.update(id, data);
      await fetchKPs();
      await fetchDOs(); // DO totals are updated on allocation changes
    } catch (err: any) {
      const message = err.response?.data?.kaanta_parchi_no?.[0] || err.response?.data?.do_allocations?.[0] || err.response?.data?.detail || 'Failed to update Kaanta Parchi';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchKPs, fetchDOs]);

  const deleteKP = useCallback(async (id: number) => {
    try {
      await kaantaParchiApi.delete(id);
      await fetchKPs();
      await fetchDOs(); // DO totals recalculate after allocation deletion
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete Kaanta Parchi');
    }
  }, [fetchKPs, fetchDOs]);

  const importKPFile = useCallback(async (file: File) => {
    const response = await kaantaParchiApi.importFile(file);
    await fetchKPs();
    await fetchDOs();
    return response.data;
  }, [fetchKPs, fetchDOs]);

  const exportKPs = useCallback(async () => {
    const response = await kaantaParchiApi.exportFile({
      ...kpFilters,
      year: kpSelectedYear,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kaanta_parchis.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [kpFilters, kpSelectedYear]);

  const setDoFilters = useCallback((filters: DeliveryOrderFilters) => {
    setActiveDoFilters(filters);
    setDoPage(1);
  }, []);

  const setKpFilters = useCallback((filters: KaantaParchiFilters) => {
    setActiveKpFilters(filters);
    setKpPage(1);
  }, []);

  const clearDoFilters = useCallback(() => {
    setActiveDoFilters({});
    setDoPage(1);
  }, []);

  const clearKpFilters = useCallback(() => {
    setActiveKpFilters({});
    setKpPage(1);
  }, []);

  const setDoYear = useCallback((year: number | 'all') => {
    setDoSelectedYear(year);
    localStorage.setItem('do_selected_year', String(year));
    setDoPage(1);
  }, []);

  const setKpYear = useCallback((year: number | 'all') => {
    setKpSelectedYear(year);
    localStorage.setItem('kp_selected_year', String(year));
    setKpPage(1);
  }, []);

  const addDoYear = useCallback((year: number) => {
    setDoAvailableYears(prev => {
      if (prev.includes(year)) return prev;
      const nums = prev.filter((y): y is number => typeof y === 'number');
      const nextNums = [...nums, year].sort((a, b) => b - a);
      const next: (number | 'all')[] = ['all', ...nextNums];
      localStorage.setItem('do_available_years', JSON.stringify(next));
      return next;
    });
    setDoYear(year);
  }, [setDoYear]);

  const addKpYear = useCallback((year: number) => {
    setKpAvailableYears(prev => {
      if (prev.includes(year)) return prev;
      const nums = prev.filter((y): y is number => typeof y === 'number');
      const nextNums = [...nums, year].sort((a, b) => b - a);
      const next: (number | 'all')[] = ['all', ...nextNums];
      localStorage.setItem('kp_available_years', JSON.stringify(next));
      return next;
    });
    setKpYear(year);
  }, [setKpYear]);

  return (
    <DeliveryOrderContext.Provider
      value={{
        deliveryOrders,
        kaantaParchis,
        doTotalCount,
        kpTotalCount,
        loading,
        error,
        doFilters,
        kpFilters,
        doSelectedYear,
        kpSelectedYear,
        doAvailableYears,
        kpAvailableYears,
        doPage,
        kpPage,
        doPageSize,
        kpPageSize,
        aggregateBgQuantity,
        setDoPage,
        setKpPage,
        setDoPageSize,
        setKpPageSize,
        fetchDOs,
        fetchKPs,
        createDO,
        updateDO,
        deleteDO,
        createKP,
        updateKP,
        deleteKP,
        importKPFile,
        exportKPs,
        fetchAggregateBgQuantity,
        setDoFilters,
        setKpFilters,
        clearDoFilters,
        clearKpFilters,
        setDoYear,
        setKpYear,
        addDoYear,
        addKpYear
      }}
    >
      {children}
    </DeliveryOrderContext.Provider>
  );
}

export function useDeliveryOrder() {
  const context = useContext(DeliveryOrderContext);
  if (context === undefined) {
    throw new Error('useDeliveryOrder must be used within a DeliveryOrderProvider');
  }
  return context;
}
