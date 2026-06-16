from rest_framework import serializers
from .models import BankGuarantee, DropdownOption


class DropdownOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DropdownOption
        fields = ['id', 'category', 'value', 'meta', 'created_at']
        read_only_fields = ['id', 'created_at']


class BankGuaranteeSerializer(serializers.ModelSerializer):
    # Computed read-only fields
    no_of_days = serializers.SerializerMethodField()
    pdc = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()

    class Meta:
        model = BankGuarantee
        fields = [
            'id', 'bank_name', 'branch_name', 'ifsc_code', 
            'debit_account_no', 'bg_account_no', 'payment_mode',
            'department', 'bg_number', 'amount_of_bg', 'issue_date',
            'expiry_date',
            # Cheque details
            'cheque_number', 'date_of_issue_of_cheque',
            'bank_name_of_cheque', 'account_no_of_cheque',
            # Online details
            'online_transaction_id', 'online_transaction_date',
            'online_payment_mode', 'online_bank_name',
            # PDC details
            'pdc_cheque_number', 'pdc_date_of_issue_of_cheque',
            'pdc_bank_name_of_cheque', 'pdc_account_no_of_cheque',
            # Computed fields
            'no_of_days', 'pdc', 'total_amount', 'quantity',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'no_of_days', 'pdc', 'total_amount', 'quantity', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            for field_name in list(data.keys()):
                if data[field_name] == '':
                    try:
                        model_field = self.Meta.model._meta.get_field(field_name)
                        if model_field.null:
                            data[field_name] = None
                    except Exception:
                        pass
        return super().to_internal_value(data)

    def get_no_of_days(self, obj):
        return obj.no_of_days

    def get_pdc(self, obj):
        return str(obj.pdc)

    def get_total_amount(self, obj):
        return str(obj.total_amount)

    def get_quantity(self, obj):
        return obj.quantity
