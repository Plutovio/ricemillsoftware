from django.contrib import admin
from .models import DeliveryOrder, KaantaParchi, KaantaParchiDOAllocation


class KaantaParchiDOAllocationInline(admin.TabularInline):
    model = KaantaParchiDOAllocation
    extra = 1
    readonly_fields = ['allocated_quantity']


@admin.register(DeliveryOrder)
class DeliveryOrderAdmin(admin.ModelAdmin):
    list_display = [
        'do_number', 'do_date', 'source', 'do_quantity_issued',
        'total_quantity', 'quantity_to_be_milled', 'remaining_quantity'
    ]
    list_filter = ['source', 'do_date']
    search_fields = ['do_number']
    readonly_fields = ['total_quantity', 'quantity_to_be_milled', 'remaining_quantity']


@admin.register(KaantaParchi)
class KaantaParchiAdmin(admin.ModelAdmin):
    list_display = [
        'kaanta_parchi_no', 'vehicle_no', 'driver_name', 'driver_mobile_no',
        'gate_pass_no', 'gate_pass_date', 'no_of_boras', 'weight_of_dhan', 'net_weight'
    ]
    list_filter = ['gate_pass_date']
    search_fields = ['kaanta_parchi_no', 'vehicle_no', 'driver_name', 'gate_pass_no']
    readonly_fields = ['weight_of_boras', 'weight_of_dhan', 'net_weight']
    inlines = [KaantaParchiDOAllocationInline]


@admin.register(KaantaParchiDOAllocation)
class KaantaParchiDOAllocationAdmin(admin.ModelAdmin):
    list_display = ['kaanta_parchi', 'delivery_order', 'allocated_boras', 'allocated_quantity']
    search_fields = ['kaanta_parchi__kaanta_parchi_no', 'delivery_order__do_number']
    readonly_fields = ['allocated_quantity']
