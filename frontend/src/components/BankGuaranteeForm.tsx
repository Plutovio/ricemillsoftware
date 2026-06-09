import React, { useState, useEffect } from 'react';
import type { BankGuarantee, BankGuaranteeFormData } from '../types/bankGuarantee';
import type { DropdownOption } from '../types/dropdown';
import { dropdownApi } from '../api/dropdownApi';
import { RMInput } from './ui/RMInput';
import { RMSelect } from './ui/RMSelect';
import { RMDatePicker } from './ui/RMDatePicker';
import { RMButton } from './ui/RMButton';
import { computePDC, computeTotalAmount, computeQuantity, computeNoOfDays } from '../utils/computedFields';
import { formatCurrency } from '../utils/formatDate';

interface BankGuaranteeFormProps {
  record?: BankGuarantee | null;
  onSubmit: (data: BankGuaranteeFormData) => Promise<void>;
  onCancel: () => void;
}

export function BankGuaranteeForm({ record, onSubmit, onCancel }: BankGuaranteeFormProps) {
  // Form fields
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [debitAccountNo, setDebitAccountNo] = useState('');
  const [bgAccountNo, setBgAccountNo] = useState('');
  const [paymentMode, setPaymentMode] = useState('cheque');
  const [department, setDepartment] = useState('');
  const [bgNumber, setBgNumber] = useState('');
  const [amountOfBg, setAmountOfBg] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Regular Cheque details
  const [chequeNumber, setChequeNumber] = useState('');
  const [dateOfIssueOfCheque, setDateOfIssueOfCheque] = useState('');
  const [bankNameOfCheque, setBankNameOfCheque] = useState('');
  const [accountNoOfCheque, setAccountNoOfCheque] = useState('');

  // Online Payment details
  const [onlineTransactionId, setOnlineTransactionId] = useState('');
  const [onlineTransactionDate, setOnlineTransactionDate] = useState('');
  const [onlinePaymentMode, setOnlinePaymentMode] = useState('');
  const [onlineBankName, setOnlineBankName] = useState('');

  // PDC Cheque details
  const [pdcChequeNumber, setPdcChequeNumber] = useState('');
  const [pdcDateOfIssueOfCheque, setPdcDateOfIssueOfCheque] = useState('');
  const [pdcBankNameOfCheque, setPdcBankNameOfCheque] = useState('');
  const [pdcAccountNoOfCheque, setPdcAccountNoOfCheque] = useState('');

  // Dropdown list options
  const [banks, setBanks] = useState<DropdownOption[]>([]);
  const [branches, setBranches] = useState<DropdownOption[]>([]);
  const [debitAccounts, setDebitAccounts] = useState<DropdownOption[]>([]);
  const [departments, setDepartments] = useState<DropdownOption[]>([]);
  const [chequeAccounts, setChequeAccounts] = useState<DropdownOption[]>([]);

  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load dropdown values
  useEffect(() => {
    async function loadAllDropdowns() {
      setLoadingDropdowns(true);
      try {
        const [rBanks, rBranches, rAccounts, rDepts, rChqAccs] = await Promise.all([
          dropdownApi.fetchOptions('bank_name'),
          dropdownApi.fetchOptions('branch_name'),
          dropdownApi.fetchOptions('debit_account_no'),
          dropdownApi.fetchOptions('department'),
          dropdownApi.fetchOptions('account_no_of_cheque'),
        ]);

        const extract = (res: any) => Array.isArray(res.data) ? res.data : (res.data.results || []);

        setBanks(extract(rBanks));
        setBranches(extract(rBranches));
        setDebitAccounts(extract(rAccounts));
        setDepartments(extract(rDepts));
        setChequeAccounts(extract(rChqAccs));
      } catch {
        setError('Failed to load dropdown options.');
      } finally {
        setLoadingDropdowns(false);
      }
    }
    loadAllDropdowns();
  }, []);

  // Pre-fill form if editing
  useEffect(() => {
    if (record) {
      setBankName(record.bank_name);
      setBranchName(record.branch_name);
      setIfscCode(record.ifsc_code);
      setDebitAccountNo(record.debit_account_no);
      setBgAccountNo(record.bg_account_no || '');
      setPaymentMode(record.payment_mode || 'cheque');
      setDepartment(record.department);
      setBgNumber(record.bg_number);
      setAmountOfBg(record.amount_of_bg);
      setIssueDate(record.issue_date);
      setExpiryDate(record.expiry_date);

      // Cheque
      setChequeNumber(record.cheque_number || '');
      setDateOfIssueOfCheque(record.date_of_issue_of_cheque || '');
      setBankNameOfCheque(record.bank_name_of_cheque || '');
      setAccountNoOfCheque(record.account_no_of_cheque || '');

      // Online
      setOnlineTransactionId(record.online_transaction_id || '');
      setOnlineTransactionDate(record.online_transaction_date || '');
      setOnlinePaymentMode(record.online_payment_mode || '');
      setOnlineBankName(record.online_bank_name || '');

      // PDC
      setPdcChequeNumber(record.pdc_cheque_number || '');
      setPdcDateOfIssueOfCheque(record.pdc_date_of_issue_of_cheque || '');
      setPdcBankNameOfCheque(record.pdc_bank_name_of_cheque || '');
      setPdcAccountNoOfCheque(record.pdc_account_no_of_cheque || '');
    }
  }, [record]);

  // Handle branch change -> auto-populate IFSC
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    setBranchName(selectedVal);
    const branchOpt = branches.find(b => b.value === selectedVal);
    if (branchOpt && branchOpt.meta?.ifsc) {
      setIfscCode(branchOpt.meta.ifsc);
    } else {
      setIfscCode('');
    }
  };

  // Live Calculations
  const numAmount = parseFloat(amountOfBg) || 0;
  const livePDC = computePDC(numAmount);
  const liveTotal = computeTotalAmount(numAmount);
  const liveQty = computeQuantity(numAmount);
  const liveDays = computeNoOfDays(issueDate, expiryDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (liveDays < 0) {
      setError('Expiry Date must be greater than or equal to Issue Date.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload: BankGuaranteeFormData = {
        bank_name: bankName,
        branch_name: branchName,
        ifsc_code: ifscCode,
        debit_account_no: debitAccountNo,
        bg_account_no: bgAccountNo,
        payment_mode: paymentMode,
        department: department,
        bg_number: bgNumber,
        amount_of_bg: amountOfBg,
        issue_date: issueDate,
        expiry_date: expiryDate,
        // Regular Cheque fields
        cheque_number: paymentMode === 'cheque' ? chequeNumber : '',
        date_of_issue_of_cheque: paymentMode === 'cheque' ? dateOfIssueOfCheque : '',
        bank_name_of_cheque: paymentMode === 'cheque' ? bankNameOfCheque : '',
        account_no_of_cheque: paymentMode === 'cheque' ? accountNoOfCheque : '',
        // Online details
        online_transaction_id: paymentMode === 'online' ? onlineTransactionId : '',
        online_transaction_date: paymentMode === 'online' ? onlineTransactionDate : '',
        online_payment_mode: paymentMode === 'online' ? onlinePaymentMode : '',
        online_bank_name: paymentMode === 'online' ? onlineBankName : '',
        // PDC Cheque fields
        pdc_cheque_number: pdcChequeNumber,
        pdc_date_of_issue_of_cheque: pdcDateOfIssueOfCheque,
        pdc_bank_name_of_cheque: pdcBankNameOfCheque,
        pdc_account_no_of_cheque: pdcAccountNoOfCheque,
      };
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the bank guarantee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Guarantee Info */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Guarantee Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RMSelect
            label="Bank Name"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            disabled={loadingDropdowns}
            required
            placeholder="Select Bank"
            options={banks.map(b => ({ value: b.value, label: b.value }))}
          />

          <RMSelect
            label="Branch Name"
            value={branchName}
            onChange={handleBranchChange}
            disabled={loadingDropdowns}
            required
            placeholder="Select Branch"
            options={branches.map(b => ({ value: b.value, label: b.value }))}
          />

          <RMInput
            label="IFSC Code"
            value={ifscCode}
            readOnly
            placeholder="Auto-populated"
            className="bg-gray-50 font-mono"
            required
          />

          <RMSelect
            label="Debit Account Number"
            value={debitAccountNo}
            onChange={(e) => setDebitAccountNo(e.target.value)}
            disabled={loadingDropdowns}
            required
            placeholder="Select Debit Account"
            options={debitAccounts.map(a => ({ value: a.value, label: a.value }))}
          />

          <RMInput
            label="BG Account Number"
            placeholder="e.g. BG-908123"
            value={bgAccountNo}
            onChange={(e) => setBgAccountNo(e.target.value)}
            required
          />

          <RMSelect
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={loadingDropdowns}
            required
            placeholder="Select Department"
            options={departments.map(d => ({ value: d.value, label: d.value }))}
          />

          <RMInput
            label="BG Number"
            placeholder="e.g. BG-2026-902"
            value={bgNumber}
            onChange={(e) => setBgNumber(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Dates and Amounts */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dates & Valuations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RMInput
            label="Amount of BG"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 100000.00"
            value={amountOfBg}
            onChange={(e) => setAmountOfBg(e.target.value)}
            required
          />

          <RMDatePicker
            label="Issue Date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />

          <RMDatePicker
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>

        {/* Live Calculation Output Card */}
        <div className="mt-4 bg-navy-50/50 border border-navy-100 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">Computed PDC (2/3)</span>
            <span className="text-sm font-semibold text-navy-800 font-mono">
              ₹ {formatCurrency(livePDC)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">Total Amount (BG + PDC)</span>
            <span className="text-sm font-semibold text-navy-800 font-mono">
              ₹ {formatCurrency(liveTotal)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">Quantity Allocation</span>
            <span className="text-sm font-semibold text-navy-800 font-mono">
              {liveQty.toLocaleString('en-IN', { minimumFractionDigits: 2 })} kg
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider block">No. of Days validity</span>
            <span className={`text-sm font-semibold font-mono ${liveDays < 0 ? 'text-red-500' : 'text-navy-800'}`}>
              {liveDays >= 0 ? `${liveDays} Days` : 'Invalid Date Range'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Details (Cheque / Online) */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Guarantee Payment Details</h3>
          {/* Segmented Control Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 w-48">
            <button
              type="button"
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all select-none ${
                paymentMode === 'cheque'
                  ? 'bg-white text-navy-800 shadow-sm border border-gray-150 font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setPaymentMode('cheque')}
            >
              Cheque
            </button>
            <button
              type="button"
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all select-none ${
                paymentMode === 'online'
                  ? 'bg-white text-navy-800 shadow-sm border border-gray-150 font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              onClick={() => setPaymentMode('online')}
            >
              Online
            </button>
          </div>
        </div>

        {paymentMode === 'cheque' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-150">
            <RMInput
              label="Cheque Number"
              placeholder="e.g. 102345"
              value={chequeNumber}
              onChange={(e) => setChequeNumber(e.target.value)}
              required={paymentMode === 'cheque'}
            />

            <RMDatePicker
              label="Cheque Issue Date"
              value={dateOfIssueOfCheque}
              onChange={(e) => setDateOfIssueOfCheque(e.target.value)}
              required={paymentMode === 'cheque'}
            />

            <RMInput
              label="Cheque Bank Name"
              placeholder="e.g. State Bank of India"
              value={bankNameOfCheque}
              onChange={(e) => setBankNameOfCheque(e.target.value)}
              required={paymentMode === 'cheque'}
            />

            <RMSelect
              label="Cheque Account Number"
              value={accountNoOfCheque}
              onChange={(e) => setAccountNoOfCheque(e.target.value)}
              disabled={loadingDropdowns}
              placeholder="Select Account"
              options={chequeAccounts.map(a => ({ value: a.value, label: a.value }))}
              required={paymentMode === 'cheque'}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-150">
            <RMInput
              label="Transaction ID / Ref"
              placeholder="e.g. TXN987654321"
              value={onlineTransactionId}
              onChange={(e) => setOnlineTransactionId(e.target.value)}
              required={paymentMode === 'online'}
            />

            <RMDatePicker
              label="Transfer Date"
              value={onlineTransactionDate}
              onChange={(e) => setOnlineTransactionDate(e.target.value)}
              required={paymentMode === 'online'}
            />

            <RMInput
              label="Payment Mode / Channel"
              placeholder="e.g. IMPS / RTGS / UPI"
              value={onlinePaymentMode}
              onChange={(e) => setOnlinePaymentMode(e.target.value)}
              required={paymentMode === 'online'}
            />

            <RMInput
              label="Initiating Bank Name"
              placeholder="e.g. ICICI Bank"
              value={onlineBankName}
              onChange={(e) => setOnlineBankName(e.target.value)}
              required={paymentMode === 'online'}
            />
          </div>
        )}
      </div>

      {/* PDC Cheque Details (Security) */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">PDC Cheque Details (Security)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-navy-50/30 rounded-xl border border-navy-100/50">
          <RMInput
            label="PDC Cheque Number"
            placeholder="e.g. 991234"
            value={pdcChequeNumber}
            onChange={(e) => setPdcChequeNumber(e.target.value)}
          />

          <RMDatePicker
            label="PDC Cheque Issue Date"
            value={pdcDateOfIssueOfCheque}
            onChange={(e) => setPdcDateOfIssueOfCheque(e.target.value)}
          />

          <RMInput
            label="PDC Bank Name"
            placeholder="e.g. Punjab National Bank"
            value={pdcBankNameOfCheque}
            onChange={(e) => setPdcBankNameOfCheque(e.target.value)}
          />

          <RMSelect
            label="PDC Account Number"
            value={pdcAccountNoOfCheque}
            onChange={(e) => setPdcAccountNoOfCheque(e.target.value)}
            disabled={loadingDropdowns}
            placeholder="Select Account"
            options={chequeAccounts.map(a => ({ value: a.value, label: a.value }))}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <RMButton type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </RMButton>
        <RMButton type="submit" variant="primary" disabled={saving || loadingDropdowns}>
          {saving ? 'Saving...' : record ? 'Update Guarantee' : 'Create Guarantee'}
        </RMButton>
      </div>
    </form>
  );
}
