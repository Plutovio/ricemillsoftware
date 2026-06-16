from django.db import models
from decimal import Decimal
from apps.core.models import BaseModel
from .constants import BORA_WEIGHT, TARE_WEIGHT_PER_BORA, MILLING_YIELD_PERCENT


class DeliveryOrder(BaseModel):
    """Represents a government allocation (NAN or FCI) for milling."""
    SOURCE_CHOICES = [
        ('NAN', 'NAN'),
        ('FCI', 'FCI'),
    ]

    do_number = models.CharField(max_length=100, unique=True)
    do_date = models.DateField()
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES)
    do_quantity_issued = models.DecimalField(max_digits=15, decimal_places=2)
    do_location = models.CharField(max_length=255, blank=True, null=True)
    
    # Running total of dhan delivered against this DO so far
    total_quantity = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    # Computed fields saved in database
    quantity_to_be_milled = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    remaining_quantity = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        ordering = ['-do_date', '-created_at']

    def __str__(self):
        return f"DO-{self.do_number} ({self.source})"

    def recalculate_totals(self):
        """Recalculate total quantity, quantity to be milled, and remaining quantity."""
        from django.db.models import Sum
        allocations = self.kaanta_allocations.all()
        total_qty = allocations.aggregate(total=Sum('allocated_quantity'))['total'] or Decimal('0.00')
        
        self.total_quantity = total_qty
        self.quantity_to_be_milled = (total_qty * MILLING_YIELD_PERCENT).quantize(Decimal('0.01'))
        
        try:
            from apps.bank_guarantee.models import BankGuarantee
            total_bg_quintals = sum(bg.quantity for bg in BankGuarantee.objects.all())
            total_bg_kg = Decimal(str(total_bg_quintals)) * Decimal('100.00')
            self.remaining_quantity = (total_bg_kg - self.do_quantity_issued).quantize(Decimal('0.01'))
        except Exception:
            self.remaining_quantity = Decimal('0.00')
        
        # Save without triggering signals or infinite loops
        DeliveryOrder.objects.filter(id=self.id).update(
            total_quantity=self.total_quantity,
            quantity_to_be_milled=self.quantity_to_be_milled,
            remaining_quantity=self.remaining_quantity
        )


class KaantaParchi(BaseModel):
    """Represents a weighbridge slip recording vehicle weighing details."""
    kaanta_parchi_no = models.CharField(max_length=100, unique=True)
    vehicle_no = models.CharField(max_length=50)
    driver_name = models.CharField(max_length=255)
    driver_mobile_no = models.CharField(max_length=20)
    gate_pass_no = models.CharField(max_length=100)
    gate_pass_date = models.DateField()
    
    no_of_boras = models.IntegerField()
    weight_of_boras = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), editable=False)
    weight_of_dhan = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), editable=False)
    
    weight_of_empty_truck = models.DecimalField(max_digits=15, decimal_places=2)
    weight_of_filled_truck = models.DecimalField(max_digits=15, decimal_places=2)
    net_weight = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), editable=False)

    class Meta:
        ordering = ['-gate_pass_date', '-created_at']

    def __str__(self):
        return f"KP-{self.kaanta_parchi_no} ({self.vehicle_no})"

    def save(self, *args, **kwargs):
        # Calculate weights
        self.weight_of_boras = Decimal(self.no_of_boras) * BORA_WEIGHT
        self.weight_of_dhan = self.weight_of_boras - (TARE_WEIGHT_PER_BORA * Decimal(self.no_of_boras))
        self.net_weight = self.weight_of_filled_truck - self.weight_of_empty_truck
        
        super().save(*args, **kwargs)
        
        # Update associated allocations if they exist (reproportions allocated quantities)
        # We check if self.pk exists to ensure we have allocations
        if self.pk:
            for alloc in self.do_allocations.all():
                alloc.save()


class KaantaParchiDOAllocation(models.Model):
    """Junction table mapping a Kaanta Parchi's bags allocation to specific DOs."""
    kaanta_parchi = models.ForeignKey(KaantaParchi, on_delete=models.CASCADE, related_name="do_allocations")
    delivery_order = models.ForeignKey(DeliveryOrder, on_delete=models.CASCADE, related_name="kaanta_allocations")
    allocated_boras = models.IntegerField()
    allocated_quantity = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'), editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['kaanta_parchi', 'delivery_order']

    def __str__(self):
        return f"KP-{self.kaanta_parchi.kaanta_parchi_no} -> DO-{self.delivery_order.do_number}"

    def save(self, *args, **kwargs):
        # Proportional calculation of allocated quantity based on boras
        total_boras = self.kaanta_parchi.no_of_boras
        if total_boras > 0:
            ratio = Decimal(self.allocated_boras) / Decimal(total_boras)
            self.allocated_quantity = (ratio * self.kaanta_parchi.weight_of_dhan).quantize(Decimal('0.01'))
        else:
            self.allocated_quantity = Decimal('0.00')
            
        super().save(*args, **kwargs)
        self.delivery_order.recalculate_totals()

    def delete(self, *args, **kwargs):
        do_instance = self.delivery_order
        super().delete(*args, **kwargs)
        do_instance.recalculate_totals()
