from django.core.management.base import BaseCommand
from decimal import Decimal
from datetime import date
from apps.bank_guarantee.models import DropdownOption
from apps.delivery_order.models import DeliveryOrder, KaantaParchi, KaantaParchiDOAllocation


class Command(BaseCommand):
    help = 'Seed the database with realistic Delivery Order and Kaanta Parchi data'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing DO and Kaanta Parchi records...')
        KaantaParchiDOAllocation.objects.all().delete()
        KaantaParchi.objects.all().delete()
        DeliveryOrder.objects.all().delete()
        DropdownOption.objects.filter(category='vehicle_no').delete()

        self.stdout.write('Seeding vehicle dropdown options...')
        self._seed_dropdowns()

        self.stdout.write('Seeding Delivery Orders...')
        dos = self._seed_delivery_orders()

        self.stdout.write('Seeding Kaanta Parchis and Allocations...')
        self._seed_kaanta_parchis(dos)

        self.stdout.write(self.style.SUCCESS('Successfully seeded DO and Kaanta Parchi module!'))

    def _seed_dropdowns(self):
        vehicles = ['PB-10-CZ-1234', 'HR-55-A-5678', 'DL-1C-B-9900', 'UP-15-T-2468', 'MH-12-Q-7890']
        for v in vehicles:
            DropdownOption.objects.create(category='vehicle_no', value=v)

    def _seed_delivery_orders(self):
        dos_data = [
            {
                'do_number': 'DO-2026-NAN-001',
                'do_date': date(2026, 1, 15),
                'source': 'NAN',
                'do_quantity_issued': Decimal('50000.00'),
            },
            {
                'do_number': 'DO-2026-FCI-002',
                'do_date': date(2026, 2, 10),
                'source': 'FCI',
                'do_quantity_issued': Decimal('100000.00'),
            },
            {
                'do_number': 'DO-2026-NAN-003',
                'do_date': date(2026, 3, 5),
                'source': 'NAN',
                'do_quantity_issued': Decimal('75000.00'),
            },
            {
                'do_number': 'DO-2026-FCI-004',
                'do_date': date(2026, 4, 20),
                'source': 'FCI',
                'do_quantity_issued': Decimal('120000.00'),
            },
        ]
        dos = {}
        for item in dos_data:
            do_obj = DeliveryOrder.objects.create(**item)
            dos[item['do_number']] = do_obj
        return dos

    def _seed_kaanta_parchis(self, dos):
        # 1. KP-1001: 200 bags, 100% to DO-2026-NAN-001
        kp1 = KaantaParchi.objects.create(
            kaanta_parchi_no='KP-1001',
            vehicle_no='PB-10-CZ-1234',
            driver_name='Satnam Singh',
            driver_mobile_no='9876543210',
            gate_pass_no='GP-9901',
            gate_pass_date=date(2026, 1, 20),
            no_of_boras=200,
            weight_of_empty_truck=Decimal('12000.00'),
            weight_of_filled_truck=Decimal('19900.00'),
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp1,
            delivery_order=dos['DO-2026-NAN-001'],
            allocated_boras=200
        )

        # 2. KP-1002: 300 bags, split: 100 to NAN-001, 200 to FCI-002
        kp2 = KaantaParchi.objects.create(
            kaanta_parchi_no='KP-1002',
            vehicle_no='HR-55-A-5678',
            driver_name='Ramesh Kumar',
            driver_mobile_no='9888776655',
            gate_pass_no='GP-9902',
            gate_pass_date=date(2026, 2, 15),
            no_of_boras=300,
            weight_of_empty_truck=Decimal('15000.00'),
            weight_of_filled_truck=Decimal('26850.00'),
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp2,
            delivery_order=dos['DO-2026-NAN-001'],
            allocated_boras=100
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp2,
            delivery_order=dos['DO-2026-FCI-002'],
            allocated_boras=200
        )

        # 3. KP-1003: 400 bags, 100% to DO-2026-FCI-002
        kp3 = KaantaParchi.objects.create(
            kaanta_parchi_no='KP-1003',
            vehicle_no='DL-1C-B-9900',
            driver_name='Manpreet Singh',
            driver_mobile_no='9911223344',
            gate_pass_no='GP-9903',
            gate_pass_date=date(2026, 2, 25),
            no_of_boras=400,
            weight_of_empty_truck=Decimal('18000.00'),
            weight_of_filled_truck=Decimal('33800.00'),
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp3,
            delivery_order=dos['DO-2026-FCI-002'],
            allocated_boras=400
        )

        # 4. KP-1004: 250 bags, split: 150 to FCI-002, 100 to NAN-003
        kp4 = KaantaParchi.objects.create(
            kaanta_parchi_no='KP-1004',
            vehicle_no='UP-15-T-2468',
            driver_name='Sanjay Yadav',
            driver_mobile_no='9560123456',
            gate_pass_no='GP-9904',
            gate_pass_date=date(2026, 3, 10),
            no_of_boras=250,
            weight_of_empty_truck=Decimal('13500.00'),
            weight_of_filled_truck=Decimal('23375.00'),
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp4,
            delivery_order=dos['DO-2026-FCI-002'],
            allocated_boras=150
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp4,
            delivery_order=dos['DO-2026-NAN-003'],
            allocated_boras=100
        )

        # 5. KP-1005: 150 bags, 100% to DO-2026-NAN-003
        kp5 = KaantaParchi.objects.create(
            kaanta_parchi_no='KP-1005',
            vehicle_no='MH-12-Q-7890',
            driver_name='Anil Shinde',
            driver_mobile_no='9011223344',
            gate_pass_no='GP-9905',
            gate_pass_date=date(2026, 3, 20),
            no_of_boras=150,
            weight_of_empty_truck=Decimal('11000.00'),
            weight_of_filled_truck=Decimal('16925.00'),
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp5,
            delivery_order=dos['DO-2026-NAN-003'],
            allocated_boras=150
        )

        # 6. KP-1006: 350 bags, 100% to DO-2026-FCI-004
        kp6 = KaantaParchi.objects.create(
            kaanta_parchi_no='KP-1006',
            vehicle_no='PB-10-CZ-1234',
            driver_name='Gurpreet Singh',
            driver_mobile_no='9444332211',
            gate_pass_no='GP-9906',
            gate_pass_date=date(2026, 4, 28),
            no_of_boras=350,
            weight_of_empty_truck=Decimal('12500.00'),
            weight_of_filled_truck=Decimal('26325.00'),
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp6,
            delivery_order=dos['DO-2026-FCI-004'],
            allocated_boras=350
        )

        # 7. KP-1007: 100 bags, split: 50 to NAN-003, 50 to FCI-004
        kp7 = KaantaParchi.objects.create(
            kaanta_parchi_no='KP-1007',
            vehicle_no='MH-12-Q-7890',
            driver_name='Rahul Patil',
            driver_mobile_no='9777665544',
            gate_pass_no='GP-9907',
            gate_pass_date=date(2026, 5, 5),
            no_of_boras=100,
            weight_of_empty_truck=Decimal('10500.00'),
            weight_of_filled_truck=Decimal('14450.00'),
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp7,
            delivery_order=dos['DO-2026-NAN-003'],
            allocated_boras=50
        )
        KaantaParchiDOAllocation.objects.create(
            kaanta_parchi=kp7,
            delivery_order=dos['DO-2026-FCI-004'],
            allocated_boras=50
        )
