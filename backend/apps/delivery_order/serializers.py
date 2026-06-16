from rest_framework import serializers
from .models import DeliveryOrder, KaantaParchi, KaantaParchiDOAllocation


class DeliveryOrderSerializer(serializers.ModelSerializer):
    aggregate_bg_quantity = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryOrder
        fields = [
            'id', 'do_number', 'do_date', 'source', 'do_quantity_issued',
            'total_quantity', 'quantity_to_be_milled', 'remaining_quantity',
            'aggregate_bg_quantity', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_quantity', 'quantity_to_be_milled', 'remaining_quantity',
            'aggregate_bg_quantity', 'created_at', 'updated_at'
        ]

    def get_aggregate_bg_quantity(self, obj):
        try:
            from apps.bank_guarantee.models import BankGuarantee
            return sum(bg.quantity for bg in BankGuarantee.objects.all())
        except ImportError:
            return 0.0


class KaantaParchiDOAllocationSerializer(serializers.ModelSerializer):
    delivery_order_number = serializers.ReadOnlyField(source='delivery_order.do_number')
    
    # Enable writing delivery_order_id
    delivery_order_id = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryOrder.objects.all(),
        source='delivery_order'
    )

    class Meta:
        model = KaantaParchiDOAllocation
        fields = [
            'id', 'delivery_order_id', 'delivery_order_number',
            'allocated_boras', 'allocated_quantity'
        ]
        read_only_fields = ['id', 'delivery_order_number', 'allocated_quantity']


class KaantaParchiSerializer(serializers.ModelSerializer):
    do_allocations = KaantaParchiDOAllocationSerializer(many=True)

    class Meta:
        model = KaantaParchi
        fields = [
            'id', 'kaanta_parchi_no', 'vehicle_no', 'driver_name',
            'driver_mobile_no', 'gate_pass_no', 'gate_pass_date',
            'no_of_boras', 'weight_of_boras', 'weight_of_dhan',
            'weight_of_empty_truck', 'weight_of_filled_truck', 'net_weight',
            'do_allocations', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'weight_of_boras', 'weight_of_dhan', 'net_weight',
            'created_at', 'updated_at'
        ]

    def validate(self, data):
        no_of_boras = data.get('no_of_boras')
        # During partial updates, no_of_boras might not be in the patch payload
        if no_of_boras is None and self.instance:
            no_of_boras = self.instance.no_of_boras

        # Check allocations in raw initial_data since we need write support
        allocations_data = data.get('do_allocations', [])
        
        if not allocations_data and not self.instance:
            raise serializers.ValidationError({"do_allocations": "At least one Delivery Order allocation is required."})

        if allocations_data:
            total_allocated_boras = sum(item.get('allocated_boras', 0) for item in allocations_data)
            if total_allocated_boras != no_of_boras:
                raise serializers.ValidationError({
                    "do_allocations": f"The sum of allocated boras ({total_allocated_boras}) must equal the total number of boras ({no_of_boras})."
                })

        return data

    def create(self, validated_data):
        allocations_data = validated_data.pop('do_allocations', [])
        kaanta_parchi = KaantaParchi.objects.create(**validated_data)
        
        for alloc_data in allocations_data:
            KaantaParchiDOAllocation.objects.create(
                kaanta_parchi=kaanta_parchi,
                **alloc_data
            )
            
        return kaanta_parchi

    def update(self, instance, validated_data):
        allocations_data = validated_data.pop('do_allocations', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if allocations_data is not None:
            # Keep track of old DO IDs to update their totals
            affected_dos = set(instance.do_allocations.values_list('delivery_order_id', flat=True))
            
            # Recreate allocations
            instance.do_allocations.all().delete()
            for alloc_data in allocations_data:
                alloc = KaantaParchiDOAllocation.objects.create(
                    kaanta_parchi=instance,
                    **alloc_data
                )
                affected_dos.add(alloc.delivery_order_id)
            
            # Recalculate totals for all old and new DOs
            for do_id in affected_dos:
                try:
                    do_obj = DeliveryOrder.objects.get(id=do_id)
                    do_obj.recalculate_totals()
                except DeliveryOrder.DoesNotExist:
                    pass
                    
        return instance
