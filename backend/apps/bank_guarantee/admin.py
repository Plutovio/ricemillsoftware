from django.contrib import admin
from .models import BankGuarantee, DropdownOption


@admin.register(DropdownOption)
class DropdownOptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'category', 'value', 'meta', 'created_at']
    list_filter = ['category']
    search_fields = ['value', 'category']
    ordering = ['category', 'value']


@admin.register(BankGuarantee)
class BankGuaranteeAdmin(admin.ModelAdmin):
    list_display = [
        'bg_number', 'bank_name', 'branch_name', 'department',
        'amount_of_bg', 'issue_date', 'expiry_date', 'get_no_of_days',
    ]
    list_filter = ['bank_name', 'department', 'issue_date']
    search_fields = ['bg_number', 'bank_name', 'branch_name']
    ordering = ['-issue_date']
    readonly_fields = ['get_no_of_days', 'get_pdc', 'get_total_amount', 'get_quantity', 'created_at', 'updated_at']

    def get_no_of_days(self, obj):
        return obj.no_of_days
    get_no_of_days.short_description = 'No. of Days'

    def get_pdc(self, obj):
        return obj.pdc
    get_pdc.short_description = 'PDC'

    def get_total_amount(self, obj):
        return obj.total_amount
    get_total_amount.short_description = 'Total Amount'

    def get_quantity(self, obj):
        return obj.quantity
    get_quantity.short_description = 'Quantity (kg)'
