import django_filters
from datetime import datetime
from .models import BankGuarantee


class BankGuaranteeFilter(django_filters.FilterSet):
    """Filter for BankGuarantee records with support for date ranges and year filtering."""
    bank_name = django_filters.CharFilter(lookup_expr='icontains')
    branch_name = django_filters.CharFilter(lookup_expr='icontains')
    debit_account_no = django_filters.CharFilter(lookup_expr='icontains')
    bg_account_no = django_filters.CharFilter(lookup_expr='icontains')
    department = django_filters.CharFilter(lookup_expr='icontains')
    bg_number = django_filters.CharFilter(lookup_expr='icontains')
    issue_date_from = django_filters.DateFilter(field_name='issue_date', lookup_expr='gte')
    issue_date_to = django_filters.DateFilter(field_name='issue_date', lookup_expr='lte')
    expiry_date_from = django_filters.DateFilter(field_name='expiry_date', lookup_expr='gte')
    expiry_date_to = django_filters.DateFilter(field_name='expiry_date', lookup_expr='lte')
    year = django_filters.NumberFilter(field_name='issue_date', lookup_expr='year')

    class Meta:
        model = BankGuarantee
        fields = [
            'bank_name', 'branch_name', 'debit_account_no', 'bg_account_no', 'department',
            'bg_number', 'issue_date_from', 'issue_date_to',
            'expiry_date_from', 'expiry_date_to', 'year',
        ]
