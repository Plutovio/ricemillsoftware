from django.db import models
from decimal import Decimal, ROUND_HALF_UP
from apps.core.models import BaseModel


class DropdownOption(BaseModel):
    """Manages dropdown options for various fields in the application.
    Categories: bank_name, branch_name, account_no, department, account_no_of_cheque
    The meta field stores associated data, e.g., {"ifsc": "SBIN0001234"} for branches.
    """
    category = models.CharField(max_length=50, db_index=True)
    value = models.CharField(max_length=255)
    meta = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['category', 'value']
        unique_together = ['category', 'value']

    def __str__(self):
        return f"{self.category}: {self.value}"


class BankGuarantee(BaseModel):
    """Represents a Bank Guarantee record in the Rice Mill system."""
    bank_name = models.CharField(max_length=255)
    branch_name = models.CharField(max_length=255)
    ifsc_code = models.CharField(max_length=20)
    debit_account_no = models.CharField(max_length=50)
    bg_account_no = models.CharField(max_length=50, blank=True, null=True)
    payment_mode = models.CharField(max_length=20, default='cheque')
    department = models.CharField(max_length=255)
    bg_number = models.CharField(max_length=100, unique=True)
    amount_of_bg = models.DecimalField(max_digits=15, decimal_places=2)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    # Cheque payment mode details
    cheque_number = models.CharField(max_length=100, blank=True, null=True)
    date_of_issue_of_cheque = models.DateField(blank=True, null=True)
    bank_name_of_cheque = models.CharField(max_length=255, blank=True, null=True)
    account_no_of_cheque = models.CharField(max_length=50, blank=True, null=True)
    # Online payment mode details
    online_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    online_transaction_date = models.DateField(blank=True, null=True)
    online_payment_mode = models.CharField(max_length=50, blank=True, null=True)
    online_bank_name = models.CharField(max_length=255, blank=True, null=True)
    # PDC Cheque details
    pdc_cheque_number = models.CharField(max_length=100, blank=True, null=True)
    pdc_date_of_issue_of_cheque = models.DateField(blank=True, null=True)
    pdc_bank_name_of_cheque = models.CharField(max_length=255, blank=True, null=True)
    pdc_account_no_of_cheque = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['-issue_date', '-created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        try:
            from apps.delivery_order.models import DeliveryOrder
            first_do = DeliveryOrder.objects.first()
            if first_do:
                first_do.recalculate_totals()
        except Exception:
            pass

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)
        try:
            from apps.delivery_order.models import DeliveryOrder
            first_do = DeliveryOrder.objects.first()
            if first_do:
                first_do.recalculate_totals()
        except Exception:
            pass

    def __str__(self):
        return f"BG-{self.bg_number} ({self.bank_name})"

    @property
    def no_of_days(self):
        """Number of days between issue date and expiry date."""
        if self.issue_date and self.expiry_date:
            return (self.expiry_date - self.issue_date).days
        return 0

    @property
    def pdc(self):
        """PDC = (2/3) x Amount of Bank Guarantee, rounded to 2 decimal places."""
        if self.amount_of_bg:
            result = (Decimal('2') / Decimal('3')) * self.amount_of_bg
            return result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return Decimal('0.00')

    @property
    def total_amount(self):
        """Total Amount = Amount of BG + PDC."""
        if self.amount_of_bg:
            return (self.amount_of_bg + self.pdc).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return Decimal('0.00')

    @property
    def quantity(self):
        """Quantity = Total Amount / 2500 (in quintals)."""
        if self.total_amount:
            result = self.total_amount / Decimal('2500')
            return float(result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
        return 0.0
