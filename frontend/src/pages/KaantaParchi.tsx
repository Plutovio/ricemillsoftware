import { useState, useEffect, Fragment } from 'react';
import { useDeliveryOrder } from '../context/DeliveryOrderContext';
import { dropdownApi } from '../api/dropdownApi';
import type { DropdownOption } from '../types/dropdown';
import type {
  KaantaParchi as KPType,
  KaantaParchiFilters
} from '../types/deliveryOrder';
import { RMModal } from '../components/ui/RMModal';
import { RMInput } from '../components/ui/RMInput';
import { RMSelect } from '../components/ui/RMSelect';
import { RMButton } from '../components/ui/RMButton';
import { BORA_WEIGHT, TARE_WEIGHT_PER_BORA } from '../constants/deliveryOrder';
import { formatCurrency } from '../utils/formatDate';
import { useBankGuarantee } from '../context/BankGuaranteeContext';
import { convertQuantity } from '../utils/unitConversion';

export function KaantaParchiPage() {
  const { quantityUnit } = useBankGuarantee();
  const {
    deliveryOrders,
    kaantaParchis,
    kpTotalCount,
    loading,
    kpFilters,
    kpSelectedYear,
    kpAvailableYears,
    kpPage,
    kpPageSize,
    setKpPage,
    aggregateBgQuantity,
    fetchDOs,
    fetchKPs,
    fetchAggregateBgQuantity,
    createDO,
    createKP,
    updateKP,
    deleteKP,
    importKPFile,
    exportKPs,
    setKpFilters,
    clearKpFilters,
    setKpYear,
    addKpYear,
  } = useDeliveryOrder();

  const unitLabel = quantityUnit === 'quintal' ? 'q' : 'kg';

  const getConvertedVal = (val: string | number) => {
    return convertQuantity(parseFloat(String(val || 0)), quantityUnit);
  };

  useEffect(() => {
    fetchDOs();
    fetchKPs();
    fetchAggregateBgQuantity();
  }, [fetchDOs, fetchKPs, fetchAggregateBgQuantity]);

  // Collapsible DO section
  const [doPanelOpen, setDoPanelOpen] = useState(false);
  const [doFormOpen, setDoFormOpen] = useState(false);

  // Kaanta Parchi Form Modal
  const [kpFormOpen, setKpFormOpen] = useState(false);
  const [editingKP, setEditingKP] = useState<KPType | null>(null);

  // Vehicles list dropdown
  const [vehicles, setVehicles] = useState<DropdownOption[]>([]);
  const [isCustomVehicle, setIsCustomVehicle] = useState(false);

  // Main KP Form fields
  const [kpNo, setKpNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [customVehicleNo, setCustomVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [gatePassNo, setGatePassNo] = useState('');
  const [gatePassDate, setGatePassDate] = useState('');
  
  const [noOfBoras, setNoOfBoras] = useState(0);
  const [emptyTruckWeight, setEmptyTruckWeight] = useState(0);
  const [filledTruckWeight, setFilledTruckWeight] = useState(0);

  // Allocation state
  const [isMultiDo, setIsMultiDo] = useState(false);
  const [singleDoId, setSingleDoId] = useState('');
  const [allocations, setAllocations] = useState<{ delivery_order_id: string; allocated_boras: number }[]>([]);

  // Page level filter states
  const [filterKpNo, setFilterKpNo] = useState(kpFilters.kaanta_parchi_no || '');
  const [filterVehicle, setFilterVehicle] = useState(kpFilters.vehicle_no || '');
  const [filterDateFrom, setFilterDateFrom] = useState(kpFilters.gate_pass_date_from || '');
  const [filterDateTo, setFilterDateTo] = useState(kpFilters.gate_pass_date_to || '');
  const [filterOpen, setFilterOpen] = useState(false);

  // Expanded row details tracking
  const [expandedKpIds, setExpandedKpIds] = useState<number[]>([]);

  // Import modal states
  const [importOpen, setImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; total_rows: number; errors: any[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Form error
  const [formError, setFormError] = useState('');

  // DO Form inline state
  const [newDoNumber, setNewDoNumber] = useState('');
  const [newDoDate, setNewDoDate] = useState('');
  const [newDoSource, setNewDoSource] = useState<'NAN' | 'FCI'>('NAN');
  const [newDoQty, setNewDoQty] = useState('');
  const [doFormError, setDoFormError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [kpFormOpen]);

  async function fetchVehicles() {
    try {
      const response = await dropdownApi.fetchOptions('vehicle_no');
      setVehicles(response.data);
    } catch {}
  }

  // Live Calculations (Weighbridge)
  const liveWeightOfBoras = noOfBoras * BORA_WEIGHT;
  const liveWeightOfDhan = liveWeightOfBoras - (TARE_WEIGHT_PER_BORA * noOfBoras);
  const liveNetWeight = filledTruckWeight - emptyTruckWeight;

  const convertedLiveWeightOfBoras = convertQuantity(liveWeightOfBoras, quantityUnit);
  const convertedLiveWeightOfDhan = convertQuantity(liveWeightOfDhan, quantityUnit);
  const convertedLiveNetWeight = convertQuantity(liveNetWeight, quantityUnit);

  // Allocation Boras Sum
  const totalAllocatedBoras = isMultiDo
    ? allocations.reduce((sum, item) => sum + (item.allocated_boras || 0), 0)
    : noOfBoras;

  const allocationBorasMatch = totalAllocatedBoras === noOfBoras;

  // Toggle expanded row
  const toggleRowExpand = (id: number) => {
    setExpandedKpIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'add_year') {
      const yrStr = window.prompt("Enter a new year (e.g. 2028):");
      if (yrStr) {
        const yr = parseInt(yrStr);
        if (!isNaN(yr) && yr >= 2000 && yr <= 2100) {
          addKpYear(yr);
        } else {
          alert("Invalid year. Please enter a 4-digit number between 2000 and 2100.");
        }
      }
      e.target.value = String(kpSelectedYear);
    } else {
      setKpYear(val === 'all' ? 'all' : parseInt(val));
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: KaantaParchiFilters = {};
    if (filterKpNo.trim()) filters.kaanta_parchi_no = filterKpNo.trim();
    if (filterVehicle.trim()) filters.vehicle_no = filterVehicle.trim();
    if (filterDateFrom) filters.gate_pass_date_from = filterDateFrom;
    if (filterDateTo) filters.gate_pass_date_to = filterDateTo;
    setKpFilters(filters);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterKpNo('');
    setFilterVehicle('');
    setFilterDateFrom('');
    setFilterDateTo('');
    clearKpFilters();
    setFilterOpen(false);
  };

  // Open creation modal
  const handleOpenCreateModal = () => {
    setEditingKP(null);
    setKpNo('');
    setVehicleNo('');
    setCustomVehicleNo('');
    setIsCustomVehicle(false);
    setDriverName('');
    setDriverMobile('');
    setGatePassNo('');
    setGatePassDate(new Date().toISOString().split('T')[0]);
    setNoOfBoras(0);
    setEmptyTruckWeight(0);
    setFilledTruckWeight(0);
    setIsMultiDo(false);
    
    // Select first DO as default if exists
    if (deliveryOrders.length > 0) {
      setSingleDoId(String(deliveryOrders[0].id));
    } else {
      setSingleDoId('');
    }
    setAllocations([]);
    setFormError('');
    setKpFormOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (kp: KPType) => {
    setEditingKP(kp);
    setKpNo(kp.kaanta_parchi_no);
    
    // Check if vehicle exists in select list
    const vehicleExists = vehicles.some(v => v.value === kp.vehicle_no);
    if (vehicleExists) {
      setVehicleNo(kp.vehicle_no);
      setIsCustomVehicle(false);
    } else {
      setVehicleNo('custom');
      setCustomVehicleNo(kp.vehicle_no);
      setIsCustomVehicle(true);
    }

    setDriverName(kp.driver_name);
    setDriverMobile(kp.driver_mobile_no);
    setGatePassNo(kp.gate_pass_no);
    setGatePassDate(kp.gate_pass_date);
    setNoOfBoras(kp.no_of_boras);
    setEmptyTruckWeight(parseFloat(String(kp.weight_of_empty_truck)));
    setFilledTruckWeight(parseFloat(String(kp.weight_of_filled_truck)));

    // Set allocations
    if (kp.do_allocations.length > 1) {
      setIsMultiDo(true);
      setAllocations(kp.do_allocations.map(a => ({
        delivery_order_id: String(a.delivery_order_id),
        allocated_boras: a.allocated_boras
      })));
    } else if (kp.do_allocations.length === 1) {
      setIsMultiDo(false);
      setSingleDoId(String(kp.do_allocations[0].delivery_order_id));
      setAllocations([]);
    } else {
      setIsMultiDo(false);
      setSingleDoId('');
      setAllocations([]);
    }
    setFormError('');
    setKpFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const finalVehicle = isCustomVehicle ? customVehicleNo.trim() : vehicleNo;
    if (!finalVehicle) {
      setFormError('Please select or enter a vehicle number.');
      return;
    }

    if (noOfBoras <= 0) {
      setFormError('Number of boras must be greater than 0.');
      return;
    }

    if (emptyTruckWeight <= 0 || filledTruckWeight <= 0) {
      setFormError('Truck weights must be greater than 0.');
      return;
    }

    if (filledTruckWeight <= emptyTruckWeight) {
      setFormError('Filled truck weight must be greater than empty truck weight.');
      return;
    }

    // Verify allocations
    let finalAllocations: { delivery_order_id: number; allocated_boras: number }[] = [];
    if (isMultiDo) {
      if (allocations.length === 0) {
        setFormError('At least one DO allocation is required when multiple DOs are selected.');
        return;
      }
      
      const sumBoras = allocations.reduce((sum, item) => sum + (item.allocated_boras || 0), 0);
      if (sumBoras !== noOfBoras) {
        setFormError(`Sum of allocated boras (${sumBoras}) must equal total boras (${noOfBoras}).`);
        return;
      }

      // Check for empty DO IDs or non-positive boras
      for (const a of allocations) {
        if (!a.delivery_order_id) {
          setFormError('Please select a Delivery Order for all allocation rows.');
          return;
        }
        if (a.allocated_boras <= 0) {
          setFormError('Allocated boras must be greater than 0.');
          return;
        }
      }

      finalAllocations = allocations.map(a => ({
        delivery_order_id: parseInt(a.delivery_order_id),
        allocated_boras: a.allocated_boras
      }));
    } else {
      if (!singleDoId) {
        setFormError('Please select a Delivery Order.');
        return;
      }
      finalAllocations = [{
        delivery_order_id: parseInt(singleDoId),
        allocated_boras: noOfBoras
      }];
    }

    try {
      const payload = {
        kaanta_parchi_no: kpNo.trim(),
        vehicle_no: finalVehicle.toUpperCase(),
        driver_name: driverName.trim(),
        driver_mobile_no: driverMobile.trim(),
        gate_pass_no: gatePassNo.trim(),
        gate_pass_date: gatePassDate,
        no_of_boras: noOfBoras,
        weight_of_empty_truck: emptyTruckWeight,
        weight_of_filled_truck: filledTruckWeight,
        do_allocations: finalAllocations as any
      };

      if (editingKP) {
        await updateKP(editingKP.id, payload);
      } else {
        await createKP(payload);
      }
      setKpFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Verify inputs.');
    }
  };

  const handleDeleteKP = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this weighbridge slip?')) {
      try {
        await deleteKP(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete record.');
      }
    }
  };

  // Add allocation row
  const addAllocationRow = () => {
    setAllocations(prev => [...prev, { delivery_order_id: '', allocated_boras: 0 }]);
  };

  // Remove allocation row
  const removeAllocationRow = (index: number) => {
    setAllocations(prev => prev.filter((_, i) => i !== index));
  };

  const handleAllocationChange = (index: number, field: string, val: string) => {
    setAllocations(prev => prev.map((item, i) => {
      if (i !== index) return item;
      if (field === 'delivery_order_id') {
        return { ...item, delivery_order_id: val };
      } else {
        return { ...item, allocated_boras: parseInt(val) || 0 };
      }
    }));
  };

  // inline DO form submit
  const handleDoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoFormError('');
    let qty = parseFloat(newDoQty);
    if (!newDoNumber.trim()) {
      setDoFormError('DO Number is required.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setDoFormError('Issued quantity must be greater than 0.');
      return;
    }

    // Convert from active unit back to kilograms for the backend
    if (quantityUnit === 'quintal') {
      qty = qty * 100;
    }

    try {
      await createDO({
        do_number: newDoNumber.trim(),
        do_date: newDoDate,
        source: newDoSource,
        do_quantity_issued: qty
      });
      setNewDoNumber('');
      setNewDoQty('');
      setDoFormError('');
      setDoFormOpen(false);
    } catch (err: any) {
      setDoFormError(err.message || 'Failed to create DO.');
    }
  };

  // Import handlers
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
      setImportError('');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImporting(true);
    setImportError('');
    setImportResult(null);
    try {
      const result = await importKPFile(selectedFile);
      setImportResult(result as any);
    } catch (err: any) {
      setImportError(err.response?.data?.error || 'Failed to import files. Check file formatting and columns.');
    } finally {
      setImporting(false);
    }
  };

  // Cross reference calculations
  const totalDOQuantity = deliveryOrders.reduce((sum, item) => sum + parseFloat(String(item.do_quantity_issued || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">DO & Kaanta Parchi (Weighbridge Slips)</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Log weighbridge truck loads, calculate net weights, and allocate sacks across active Delivery Orders</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Year selector */}
          <div className="relative">
            <select
              value={kpSelectedYear}
              onChange={handleYearChange}
              className="px-3 py-2 text-xs font-semibold border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-500 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[position:right_6px_center] bg-no-repeat"
            >
              {kpAvailableYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr === 'all' ? 'See All Years' : `Year ${yr}`}
                </option>
              ))}
              <option value="add_year" className="text-navy-600 dark:text-navy-400 font-bold">+ Add Year...</option>
            </select>
          </div>

          <RMButton onClick={() => setFilterOpen(true)} variant="outline">
            Filters
          </RMButton>

          <RMButton onClick={() => setImportOpen(true)} variant="outline">
            Import
          </RMButton>

          <RMButton onClick={exportKPs} variant="outline">
            Export
          </RMButton>

          <RMButton onClick={handleOpenCreateModal} variant="primary">
            + Add Kaanta Parchi
          </RMButton>
        </div>
      </div>

      {/* SECTION A: Add/View Delivery Orders (Collapsible) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-all duration-300">
        <button
          onClick={() => setDoPanelOpen(prev => !prev)}
          className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-900/20 hover:bg-gray-50 dark:hover:bg-slate-850/50 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${doPanelOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Section A: Add / View Delivery Orders</h3>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Verify quotas and cross-reference Bank Guarantee allocations</p>
            </div>
          </div>
          
          {/* Quick counter badge */}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy-50 dark:bg-navy-950 text-navy-800 dark:text-navy-200">
            {deliveryOrders.length} DOs Available
          </span>
        </button>

        {doPanelOpen && (
          <div className="p-4 border-t border-gray-150 dark:border-slate-800 space-y-6">
            {/* Quick summary and comparative cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-navy-50/40 dark:bg-slate-950/20 border border-navy-100 dark:border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-navy-500 dark:text-navy-400 uppercase tracking-wider block mb-1">Aggregate DO Allocations</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-navy-850 dark:text-white font-mono">{formatCurrency(getConvertedVal(totalDOQuantity))}</span>
                  <span className="text-xs text-gray-500 font-mono">{unitLabel}</span>
                </div>
              </div>

              <div className="bg-emerald-50/40 dark:bg-slate-950/20 border border-emerald-100 dark:border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider block mb-1">BG Quota Cross-Reference</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">{formatCurrency(getConvertedVal(aggregateBgQuantity))}</span>
                  <span className="text-xs text-gray-500 font-mono">{unitLabel}</span>
                </div>
                <p className="text-[9px] text-gray-500 dark:text-slate-500 font-medium mt-1">Total quantity active across all Bank Guarantees</p>
              </div>

              <div className="flex items-center justify-center border border-dashed border-gray-300 dark:border-slate-700 p-4 rounded-xl">
                <RMButton onClick={() => {
                  setNewDoNumber('');
                  setNewDoDate(new Date().toISOString().split('T')[0]);
                  setNewDoQty('');
                  setDoFormError('');
                  setDoFormOpen(true);
                }} variant="outline" className="py-2.5 w-full text-xs">
                  + Add New Delivery Order
                </RMButton>
              </div>
            </div>

            {/* DOs list grid */}
            <div className="border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-2">DO Number</th>
                    <th className="px-4 py-2">DO Date</th>
                    <th className="px-4 py-2">Source</th>
                    <th className="px-4 py-2 text-right">Total BG Quantity ({unitLabel})</th>
                    <th className="px-4 py-2 text-right">Quantity Issued ({unitLabel})</th>
                    <th className="px-4 py-2 text-right">Total Delivered ({unitLabel})</th>
                    <th className="px-4 py-2 text-right">Qty to be Milled (67% - {unitLabel})</th>
                    <th className="px-4 py-2 text-right">Remaining Quota ({unitLabel})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium text-gray-700 dark:text-slate-300">
                  {deliveryOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                        No active Delivery Orders found.
                      </td>
                    </tr>
                  ) : (
                    deliveryOrders.map(doObj => (
                      <tr key={doObj.id} className="hover:bg-gray-50/20 dark:hover:bg-slate-850/20">
                        <td className="px-4 py-2 text-gray-900 dark:text-white font-bold">{doObj.do_number}</td>
                        <td className="px-4 py-2">{doObj.do_date}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-slate-800 dark:text-slate-200">{doObj.source}</span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-navy-800 dark:text-navy-200">{formatCurrency(getConvertedVal(doObj.aggregate_bg_quantity ?? 0))}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatCurrency(getConvertedVal(doObj.do_quantity_issued))}</td>
                        <td className="px-4 py-2 text-right font-mono text-green-600 dark:text-green-400">{formatCurrency(getConvertedVal(doObj.total_quantity))}</td>
                        <td className="px-4 py-2 text-right font-mono text-blue-600 dark:text-blue-400">{formatCurrency(getConvertedVal(doObj.quantity_to_be_milled))}</td>
                        <td className="px-4 py-2 text-right font-mono text-amber-600 dark:text-amber-400">{formatCurrency(getConvertedVal(doObj.remaining_quantity))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECTION C: Kaanta Parchi List Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="p-4 bg-gray-50/50 dark:bg-slate-900/20 border-b border-gray-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Kaanta Parchis (Weighbridge Slips)</h3>
          <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Click on a row to expand and view split allocation details</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-850 border-b border-gray-200 dark:border-slate-850 text-[10px] font-bold text-gray-500 dark:text-slate-450 uppercase tracking-wider select-none">
                <th className="w-8 px-4 py-3"></th>
                <th className="px-4 py-3">Parchi No.</th>
                <th className="px-4 py-3">Vehicle No.</th>
                <th className="px-4 py-3">Driver Name</th>
                <th className="px-4 py-3">Driver Mobile</th>
                <th className="px-4 py-3">Gate Pass No.</th>
                <th className="px-4 py-3">Gate Pass Date</th>
                <th className="px-4 py-3 text-right">No. of Sacks</th>
                <th className="px-4 py-3 text-right">Sack Wt ({unitLabel})</th>
                <th className="px-4 py-3 text-right">Dhan Wt ({unitLabel})</th>
                <th className="px-4 py-3 text-right">Empty Truck ({unitLabel})</th>
                <th className="px-4 py-3 text-right">Filled Truck ({unitLabel})</th>
                <th className="px-4 py-3 text-right font-bold">Net Wt ({unitLabel})</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading && kaantaParchis.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400 font-mono text-xs">
                    Loading weighbridge slips...
                  </td>
                </tr>
              ) : kaantaParchis.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">
                    No weighbridge slips found for this period.
                  </td>
                </tr>
              ) : (
                kaantaParchis.map(kp => {
                  const isExpanded = expandedKpIds.includes(kp.id);
                  return (
                    <Fragment key={kp.id}>
                      <tr
                        key={kp.id}
                        onClick={() => toggleRowExpand(kp.id)}
                        className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-navy-50/10 dark:bg-slate-900/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3.5 text-center">
                          <svg className={`w-3.5 h-3.5 text-gray-450 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">{kp.kaanta_parchi_no}</td>
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-800 dark:text-slate-200">{kp.vehicle_no}</td>
                        <td className="px-4 py-3.5">{kp.driver_name}</td>
                        <td className="px-4 py-3.5 font-mono text-xs">{kp.driver_mobile_no}</td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-slate-350">{kp.gate_pass_no}</td>
                        <td className="px-4 py-3.5 text-gray-600 dark:text-slate-350">{kp.gate_pass_date}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-medium">{kp.no_of_boras}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-600 dark:text-slate-350">{formatCurrency(getConvertedVal(kp.weight_of_boras))}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-800 dark:text-slate-200">{formatCurrency(getConvertedVal(kp.weight_of_dhan))}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-600 dark:text-slate-350">{formatCurrency(getConvertedVal(kp.weight_of_empty_truck))}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-600 dark:text-slate-350">{formatCurrency(getConvertedVal(kp.weight_of_filled_truck))}</td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-navy-800 dark:text-white">{formatCurrency(getConvertedVal(kp.net_weight))}</td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-3 select-none">
                            <button
                              onClick={() => handleOpenEditModal(kp)}
                              className="text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200 text-xs font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteKP(kp.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded row allocation details */}
                      {isExpanded && (
                        <tr className="bg-gray-50/30 dark:bg-slate-900/20">
                          <td colSpan={14} className="px-10 py-3.5 border-t border-b border-gray-150 dark:border-slate-800">
                            <div className="space-y-2 select-none">
                              <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">DO Allocation Breakdown</h4>
                              <div className="flex flex-wrap gap-4">
                                {kp.do_allocations.map(a => (
                                  <div key={a.id || a.delivery_order_id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg flex items-center gap-4 text-xs font-semibold">
                                    <div>
                                      <span className="text-[10px] text-gray-400 block">DO Number</span>
                                      <span className="text-gray-800 dark:text-white">{a.delivery_order_number}</span>
                                    </div>
                                    <div className="border-l border-gray-250 dark:border-slate-700 h-6"></div>
                                    <div>
                                      <span className="text-[10px] text-gray-400 block">Sacks Allocated</span>
                                      <span className="text-gray-800 dark:text-white font-mono">{a.allocated_boras} bags</span>
                                    </div>
                                    <div className="border-l border-gray-250 dark:border-slate-700 h-6"></div>
                                    <div>
                                      <span className="text-[10px] text-gray-400 block">Proportional Quantity ({unitLabel})</span>
                                      <span className="text-navy-650 dark:text-navy-350 font-mono">{formatCurrency(getConvertedVal(a.allocated_quantity ?? 0))} {unitLabel}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {kpTotalCount > kpPageSize && (
          <div className="p-4 bg-gray-50/50 dark:bg-slate-900/40 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-slate-400 select-none">
            <span>Showing {kaantaParchis.length} of {kpTotalCount} slips</span>
            <div className="flex gap-2">
              <RMButton
                disabled={kpPage === 1}
                onClick={() => setKpPage(kpPage - 1)}
                variant="outline"
                className="py-1 px-3"
              >
                Previous
              </RMButton>
              <RMButton
                disabled={kpPage * kpPageSize >= kpTotalCount}
                onClick={() => setKpPage(kpPage + 1)}
                variant="outline"
                className="py-1 px-3"
              >
                Next
              </RMButton>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT KAANTA PARCHI FORM MODAL */}
      <RMModal
        isOpen={kpFormOpen}
        onClose={() => setKpFormOpen(false)}
        title={editingKP ? 'Edit Weighbridge Slip' : 'Create Weighbridge Slip (Kaanta Parchi)'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {formError}
            </div>
          )}

          {/* Section A: Truck & Driver Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-navy-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-1.5 select-none">1. Vehicle & Driver Identification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RMInput
                label="Kaanta Parchi No."
                placeholder="e.g. KP-2291"
                value={kpNo}
                onChange={(e) => setKpNo(e.target.value)}
                required
              />

              {isCustomVehicle ? (
                <div className="flex flex-col gap-1">
                  <RMInput
                    label="Enter Vehicle No."
                    placeholder="e.g. PB-10-CZ-1234"
                    value={customVehicleNo}
                    onChange={(e) => setCustomVehicleNo(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomVehicle(false);
                      setVehicleNo(vehicles.length > 0 ? vehicles[0].value : '');
                    }}
                    className="text-left text-[10px] text-navy-600 dark:text-navy-400 hover:underline mt-0.5 font-semibold"
                  >
                    Select existing list
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <RMSelect
                    label="Vehicle No."
                    value={vehicleNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomVehicle(true);
                        setCustomVehicleNo('');
                      } else {
                        setVehicleNo(val);
                      }
                    }}
                    options={[
                      ...vehicles.map(v => ({ value: v.value, label: v.value })),
                      { value: 'custom', label: '+ Add custom vehicle...' }
                    ]}
                    placeholder="Select vehicle"
                  />
                </div>
              )}

              <RMInput
                label="Driver Name"
                placeholder="John Doe"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RMInput
                label="Driver Mobile"
                placeholder="98765 43210"
                value={driverMobile}
                onChange={(e) => setDriverMobile(e.target.value)}
                required
              />

              <RMInput
                label="Gate Pass No."
                placeholder="e.g. GP-8810"
                value={gatePassNo}
                onChange={(e) => setGatePassNo(e.target.value)}
                required
              />

              <RMInput
                label="Gate Pass Date"
                type="date"
                value={gatePassDate}
                onChange={(e) => setGatePassDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section B: Sacks & Weighbridge values */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-navy-800 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-850 pb-1.5 select-none">2. Sacks and Weighbridge Measurements</h4>
            
            {/* Live calculations panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RMInput
                label="No. of Sacks (Boras)"
                type="number"
                placeholder="e.g. 200"
                value={noOfBoras || ''}
                onChange={(e) => setNoOfBoras(parseInt(e.target.value) || 0)}
                required
              />

              <RMInput
                label={`Weight of Sacks (Boras) [Auto - ${unitLabel}]`}
                readOnly
                value={noOfBoras ? `${formatCurrency(convertedLiveWeightOfBoras)} ${unitLabel}` : `0.00 ${unitLabel}`}
                helperText={`Computed as sacks × ${convertQuantity(BORA_WEIGHT, quantityUnit)} ${unitLabel}`}
              />

              <RMInput
                label={`Weight of Dhan [Auto - ${unitLabel}]`}
                readOnly
                value={noOfBoras ? `${formatCurrency(convertedLiveWeightOfDhan)} ${unitLabel}` : `0.00 ${unitLabel}`}
                helperText={`Sacks Wt − (${convertQuantity(TARE_WEIGHT_PER_BORA, quantityUnit)} ${unitLabel} tare × sacks)`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <RMInput
                label={`Weight of Empty Truck (${unitLabel})`}
                type="number"
                placeholder={quantityUnit === 'quintal' ? 'e.g. 120' : 'e.g. 12000'}
                value={quantityUnit === 'quintal' ? (emptyTruckWeight ? emptyTruckWeight / 100 : '') : (emptyTruckWeight || '')}
                onChange={(e) => setEmptyTruckWeight(quantityUnit === 'quintal' ? (parseFloat(e.target.value) || 0) * 100 : (parseFloat(e.target.value) || 0))}
                required
              />

              <RMInput
                label={`Weight of Filled Truck (${unitLabel})`}
                type="number"
                placeholder={quantityUnit === 'quintal' ? 'e.g. 199' : 'e.g. 19900'}
                value={quantityUnit === 'quintal' ? (filledTruckWeight ? filledTruckWeight / 100 : '') : (filledTruckWeight || '')}
                onChange={(e) => setFilledTruckWeight(quantityUnit === 'quintal' ? (parseFloat(e.target.value) || 0) * 100 : (parseFloat(e.target.value) || 0))}
                required
              />

              <RMInput
                label={`Net Weight [Auto - ${unitLabel}]`}
                readOnly
                value={`${formatCurrency(convertedLiveNetWeight)} ${unitLabel}`}
                helperText="Filled Weight − Empty Weight"
                className={liveNetWeight < 0 ? 'text-red-500 font-bold' : 'font-bold'}
              />
            </div>
          </div>

          {/* Section C: DO Allocations sub-section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-850 pb-1.5 select-none">
              <h4 className="text-xs font-bold text-navy-800 dark:text-white uppercase tracking-wider">3. Delivery Order (DO) Allocation</h4>
              
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMultiDo}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsMultiDo(checked);
                    if (checked && allocations.length === 0) {
                      setAllocations([{ delivery_order_id: '', allocated_boras: 0 }]);
                    }
                  }}
                  className="rounded text-navy-600 focus:ring-navy-500 h-4 w-4"
                />
                Boras from multiple DOs?
              </label>
            </div>

            {deliveryOrders.length === 0 ? (
              <div className="p-3 text-xs text-amber-700 bg-amber-50 rounded-lg select-none">
                No active Delivery Orders found. Please add a Delivery Order in Section A first.
              </div>
            ) : !isMultiDo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RMSelect
                  label="Select Delivery Order"
                  value={singleDoId}
                  onChange={(e) => setSingleDoId(e.target.value)}
                  options={deliveryOrders.map(d => ({ value: String(d.id), label: `${d.do_number} (${d.source})` }))}
                  required
                />
                <RMInput
                  label={`Quantity Allocated (100% Dhan Wt - ${unitLabel})`}
                  readOnly
                  value={`${formatCurrency(convertedLiveWeightOfDhan)} ${unitLabel}`}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Warnings and counter */}
                <div className={`p-3 rounded-lg text-xs font-semibold select-none flex items-center justify-between ${
                  allocationBorasMatch 
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                }`}>
                  <span>Allocated: {totalAllocatedBoras} / {noOfBoras} bags</span>
                  {allocationBorasMatch ? (
                    <span>✔ Bags Match Successfully</span>
                  ) : (
                    <span>⚠ Sacks allocated must equal {noOfBoras} total sacks</span>
                  )}
                </div>

                <div className="space-y-3">
                  {allocations.map((row, index) => {
                    const proportionalQty = noOfBoras > 0
                      ? ((row.allocated_boras || 0) / noOfBoras) * liveWeightOfDhan
                      : 0;
                    return (
                      <div key={index} className="flex flex-wrap items-end gap-3 bg-gray-50/50 dark:bg-slate-900/30 p-3 rounded-lg border border-gray-150 dark:border-slate-800">
                        <div className="w-56">
                          <RMSelect
                            label="DO Name"
                            value={row.delivery_order_id}
                            onChange={(e) => handleAllocationChange(index, 'delivery_order_id', e.target.value)}
                            options={deliveryOrders.map(d => ({ value: String(d.id), label: `${d.do_number} (${d.source})` }))}
                            placeholder="Select DO"
                          />
                        </div>
                        <div className="w-32">
                          <RMInput
                            label="Allocated Bags"
                            type="number"
                            placeholder="e.g. 100"
                            value={row.allocated_boras || ''}
                            onChange={(e) => handleAllocationChange(index, 'allocated_boras', e.target.value)}
                          />
                        </div>
                        <div className="w-44">
                          <RMInput
                            label={`Allocated Dhan (${unitLabel})`}
                            readOnly
                            value={`${formatCurrency(convertQuantity(proportionalQty, quantityUnit))} ${unitLabel}`}
                          />
                        </div>
                        <RMButton
                          type="button"
                          variant="outline"
                          onClick={() => removeAllocationRow(index)}
                          className="py-2.5 px-3 border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Remove
                        </RMButton>
                      </div>
                    );
                  })}
                </div>

                <RMButton
                  type="button"
                  variant="outline"
                  onClick={addAllocationRow}
                  className="w-full text-xs font-semibold py-2"
                >
                  + Add another DO
                </RMButton>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
            <RMButton type="button" variant="outline" onClick={() => setKpFormOpen(false)}>
              Cancel
            </RMButton>
            <RMButton
              type="submit"
              variant="primary"
              disabled={isMultiDo && !allocationBorasMatch}
            >
              {editingKP ? 'Save Changes' : 'Save Slip'}
            </RMButton>
          </div>
        </form>
      </RMModal>

      {/* FILTER MODAL */}
      <RMModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Search & Filters"
        size="md"
      >
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <RMInput
            label="Kaanta Parchi Slip No."
            placeholder="e.g. KP-1001"
            value={filterKpNo}
            onChange={(e) => setFilterKpNo(e.target.value)}
          />

          <RMInput
            label="Vehicle No."
            placeholder="e.g. PB-10"
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <RMInput
              label="Gate Pass Date From"
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
            <RMInput
              label="Gate Pass Date To"
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-slate-800">
            <RMButton type="button" variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </RMButton>
            <RMButton type="submit" variant="primary">
              Apply Filters
            </RMButton>
          </div>
        </form>
      </RMModal>

      {/* BULK IMPORT MODAL */}
      <RMModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Kaanta Parchis from Excel/CSV"
        size="md"
      >
        <form onSubmit={handleImportSubmit} className="space-y-4">
          {importError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {importError}
            </div>
          )}

          {importResult && (
            <div className={`p-4 rounded-lg text-xs ${
              importResult.errors.length === 0 ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
            }`}>
              <p className="font-bold">Import Result Summary:</p>
              <ul className="list-disc pl-4 mt-2">
                <li>Successfully Imported: {importResult.imported} records</li>
                <li>Total Rows Processed: {importResult.total_rows}</li>
                {importResult.errors.length > 0 && (
                  <li className="text-red-600 font-semibold mt-1">
                    Failed rows: {importResult.errors.length} (see log details below)
                  </li>
                )}
              </ul>
              {importResult.errors.length > 0 && (
                <div className="mt-3 max-h-[150px] overflow-y-auto border border-amber-200 p-2 bg-white rounded font-mono text-[10px]">
                  {importResult.errors.map((e, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-1 mb-1 last:border-0">
                      Row {e.row}: {JSON.stringify(e.errors)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1 select-none">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Select Excel (.xlsx) or CSV File
            </label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportFileChange}
              className="w-full text-xs text-gray-500 border border-gray-200 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-900 px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-slate-800 select-none">
            <RMButton type="button" variant="outline" onClick={() => setImportOpen(false)}>
              Close
            </RMButton>
            <RMButton type="submit" variant="primary" disabled={importing || !selectedFile}>
              {importing ? 'Processing file...' : 'Import Data'}
            </RMButton>
          </div>
        </form>
      </RMModal>

      {/* INLINE DO FORM MODAL */}
      <RMModal
        isOpen={doFormOpen}
        onClose={() => setDoFormOpen(false)}
        title="Add Delivery Order"
        size="md"
      >
        <form onSubmit={handleDoSubmit} className="space-y-4">
          {doFormError && (
            <div className="p-3 text-xs text-red-600 bg-red-55 border border-red-200 rounded-lg">
              {doFormError}
            </div>
          )}

          <RMInput
            label="DO Number"
            placeholder="DO-2026-NAN-005"
            value={newDoNumber}
            onChange={(e) => setNewDoNumber(e.target.value)}
            required
          />

          <RMInput
            label="DO Date"
            type="date"
            value={newDoDate}
            onChange={(e) => setNewDoDate(e.target.value)}
            required
          />

          <RMSelect
            label="Agency Source"
            value={newDoSource}
            onChange={(e) => setNewDoSource(e.target.value as 'NAN' | 'FCI')}
            options={[
              { value: 'NAN', label: 'NAN' },
              { value: 'FCI', label: 'FCI' }
            ]}
          />

          <RMInput
            label={`DO Quantity Issued (${unitLabel})`}
            type="number"
            placeholder={quantityUnit === 'quintal' ? 'e.g. 500' : 'e.g. 50000'}
            value={newDoQty}
            onChange={(e) => setNewDoQty(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-150 dark:border-slate-800">
            <RMButton type="button" variant="outline" onClick={() => setDoFormOpen(false)}>
              Cancel
            </RMButton>
            <RMButton type="submit" variant="primary">
              Create DO
            </RMButton>
          </div>
        </form>
      </RMModal>
    </div>
  );
}
