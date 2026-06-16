import django_filters
from .models import DeliveryOrder, KaantaParchi


class DeliveryOrderFilter(django_filters.FilterSet):
    do_number = django_filters.CharFilter(lookup_expr='icontains')
    source = django_filters.CharFilter(lookup_expr='exact')
    year = django_filters.CharFilter(method='filter_year')

    class Meta:
        model = DeliveryOrder
        fields = ['do_number', 'source', 'year']

    def filter_year(self, queryset, name, value):
        if value == 'all':
            return queryset
        try:
            year_val = int(value)
            return queryset.filter(do_date__year=year_val)
        except ValueError:
            return queryset


class KaantaParchiFilter(django_filters.FilterSet):
    kaanta_parchi_no = django_filters.CharFilter(lookup_expr='icontains')
    vehicle_no = django_filters.CharFilter(lookup_expr='icontains')
    gate_pass_date_from = django_filters.DateFilter(field_name='gate_pass_date', lookup_expr='gte')
    gate_pass_date_to = django_filters.DateFilter(field_name='gate_pass_date', lookup_expr='lte')
    year = django_filters.CharFilter(method='filter_year')

    class Meta:
        model = KaantaParchi
        fields = ['kaanta_parchi_no', 'vehicle_no', 'gate_pass_date_from', 'gate_pass_date_to', 'year']

    def filter_year(self, queryset, name, value):
        if value == 'all':
            return queryset
        try:
            year_val = int(value)
            return queryset.filter(gate_pass_date__year=year_val)
        except ValueError:
            return queryset
