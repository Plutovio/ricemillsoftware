from django.core.management.base import BaseCommand
from apps.bank_guarantee.models import DropdownOption, BankGuarantee
from decimal import Decimal
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Seed the database with realistic Bank Guarantee data and dropdown options'

    def handle(self, *args, **options):
        self.stdout.write('Seeding dropdown options...')
        self._seed_dropdowns()
        self.stdout.write('Seeding Bank Guarantee records...')
        self._seed_bank_guarantees()
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))

    def _seed_dropdowns(self):
        # Clear existing
        DropdownOption.objects.all().delete()

        # Bank Names
        banks = ['State Bank of India', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank']
        for bank in banks:
            DropdownOption.objects.create(category='bank_name', value=bank)

        # Branch Names with IFSC codes
        branches = [
            ('SBI Main Branch, Delhi', {'ifsc': 'SBIN0001234'}),
            ('SBI Industrial Area, Chandigarh', {'ifsc': 'SBIN0005678'}),
            ('PNB Sector 17, Chandigarh', {'ifsc': 'PUNB0123400'}),
            ('PNB Civil Lines, Delhi', {'ifsc': 'PUNB0567800'}),
            ('BOB Grain Market, Karnal', {'ifsc': 'BARB0KARNAL'}),
            ('BOB GT Road, Panipat', {'ifsc': 'BARB0PANIPA'}),
            ('Canara Bank Mandi Gobindgarh', {'ifsc': 'CNRB0001234'}),
            ('Canara Bank Rajpura', {'ifsc': 'CNRB0005678'}),
        ]
        for branch, meta in branches:
            DropdownOption.objects.create(category='branch_name', value=branch, meta=meta)

        # Departments
        departments = ['Procurement', 'Operations', 'Logistics', 'Accounts']
        for dept in departments:
            DropdownOption.objects.create(category='department', value=dept)

        # Account Numbers
        accounts = [
            '10234567890', '20345678901', '30456789012',
            '40567890123', '50678901234', '60789012345',
        ]
        for acc in accounts:
            DropdownOption.objects.create(category='account_no', value=acc)

        # Account Numbers for Cheque
        cheque_accounts = ['10234567890', '20345678901', '30456789012', '40567890123']
        for acc in cheque_accounts:
            DropdownOption.objects.create(category='account_no_of_cheque', value=acc)

        self.stdout.write(f'  Created {DropdownOption.objects.count()} dropdown options')

    def _seed_bank_guarantees(self):
        # Clear existing
        BankGuarantee.objects.all().delete()

        today = date.today()

        records = [
            {
                'bank_name': 'State Bank of India',
                'branch_name': 'SBI Main Branch, Delhi',
                'ifsc_code': 'SBIN0001234',
                'account_no': '10234567890',
                'department': 'Procurement',
                'bg_number': 'BG-2026-001',
                'amount_of_bg': Decimal('500000.00'),
                'issue_date': date(2026, 1, 15),
                'expiry_date': date(2026, 7, 15),
                'cheque_number': 'CHQ-001234',
                'date_of_issue_of_cheque': date(2026, 1, 10),
                'bank_name_of_cheque': 'State Bank of India',
                'account_no_of_cheque': '10234567890',
            },
            {
                'bank_name': 'Punjab National Bank',
                'branch_name': 'PNB Sector 17, Chandigarh',
                'ifsc_code': 'PUNB0123400',
                'account_no': '20345678901',
                'department': 'Operations',
                'bg_number': 'BG-2026-002',
                'amount_of_bg': Decimal('750000.00'),
                'issue_date': date(2026, 2, 1),
                'expiry_date': date(2026, 8, 1),
                'cheque_number': 'CHQ-002345',
                'date_of_issue_of_cheque': date(2026, 1, 28),
                'bank_name_of_cheque': 'Punjab National Bank',
                'account_no_of_cheque': '20345678901',
            },
            {
                'bank_name': 'Bank of Baroda',
                'branch_name': 'BOB Grain Market, Karnal',
                'ifsc_code': 'BARB0KARNAL',
                'account_no': '30456789012',
                'department': 'Logistics',
                'bg_number': 'BG-2026-003',
                'amount_of_bg': Decimal('1000000.00'),
                'issue_date': date(2026, 3, 10),
                'expiry_date': date(2026, 9, 10),
                'cheque_number': None,
                'date_of_issue_of_cheque': None,
                'bank_name_of_cheque': None,
                'account_no_of_cheque': None,
            },
            {
                'bank_name': 'Canara Bank',
                'branch_name': 'Canara Bank Mandi Gobindgarh',
                'ifsc_code': 'CNRB0001234',
                'account_no': '40567890123',
                'department': 'Accounts',
                'bg_number': 'BG-2026-004',
                'amount_of_bg': Decimal('250000.00'),
                'issue_date': date(2026, 4, 1),
                'expiry_date': today + timedelta(days=15),  # Expiring soon!
                'cheque_number': 'CHQ-004567',
                'date_of_issue_of_cheque': date(2026, 3, 28),
                'bank_name_of_cheque': 'Canara Bank',
                'account_no_of_cheque': '30456789012',
            },
            {
                'bank_name': 'State Bank of India',
                'branch_name': 'SBI Industrial Area, Chandigarh',
                'ifsc_code': 'SBIN0005678',
                'account_no': '50678901234',
                'department': 'Procurement',
                'bg_number': 'BG-2026-005',
                'amount_of_bg': Decimal('1500000.00'),
                'issue_date': date(2026, 1, 1),
                'expiry_date': today + timedelta(days=25),  # Expiring soon!
                'cheque_number': 'CHQ-005678',
                'date_of_issue_of_cheque': date(2025, 12, 28),
                'bank_name_of_cheque': 'State Bank of India',
                'account_no_of_cheque': '10234567890',
            },
            {
                'bank_name': 'Punjab National Bank',
                'branch_name': 'PNB Civil Lines, Delhi',
                'ifsc_code': 'PUNB0567800',
                'account_no': '60789012345',
                'department': 'Operations',
                'bg_number': 'BG-2026-006',
                'amount_of_bg': Decimal('300000.00'),
                'issue_date': date(2026, 5, 1),
                'expiry_date': date(2026, 11, 1),
                'cheque_number': None,
                'date_of_issue_of_cheque': None,
                'bank_name_of_cheque': None,
                'account_no_of_cheque': None,
            },
            {
                'bank_name': 'Bank of Baroda',
                'branch_name': 'BOB GT Road, Panipat',
                'ifsc_code': 'BARB0PANIPA',
                'account_no': '10234567890',
                'department': 'Logistics',
                'bg_number': 'BG-2026-007',
                'amount_of_bg': Decimal('800000.00'),
                'issue_date': date(2026, 3, 15),
                'expiry_date': today + timedelta(days=5),  # Expiring very soon!
                'cheque_number': 'CHQ-007890',
                'date_of_issue_of_cheque': date(2026, 3, 10),
                'bank_name_of_cheque': 'Bank of Baroda',
                'account_no_of_cheque': '20345678901',
            },
            {
                'bank_name': 'Canara Bank',
                'branch_name': 'Canara Bank Rajpura',
                'ifsc_code': 'CNRB0005678',
                'account_no': '20345678901',
                'department': 'Accounts',
                'bg_number': 'BG-2026-008',
                'amount_of_bg': Decimal('450000.00'),
                'issue_date': date(2026, 2, 15),
                'expiry_date': date(2026, 8, 15),
                'cheque_number': 'CHQ-008901',
                'date_of_issue_of_cheque': date(2026, 2, 12),
                'bank_name_of_cheque': 'Canara Bank',
                'account_no_of_cheque': '40567890123',
            },
            {
                'bank_name': 'State Bank of India',
                'branch_name': 'SBI Main Branch, Delhi',
                'ifsc_code': 'SBIN0001234',
                'account_no': '30456789012',
                'department': 'Procurement',
                'bg_number': 'BG-2026-009',
                'amount_of_bg': Decimal('2000000.00'),
                'issue_date': date(2026, 4, 20),
                'expiry_date': date(2026, 10, 20),
                'cheque_number': 'CHQ-009012',
                'date_of_issue_of_cheque': date(2026, 4, 18),
                'bank_name_of_cheque': 'State Bank of India',
                'account_no_of_cheque': '10234567890',
            },
            {
                'bank_name': 'Punjab National Bank',
                'branch_name': 'PNB Sector 17, Chandigarh',
                'ifsc_code': 'PUNB0123400',
                'account_no': '40567890123',
                'department': 'Operations',
                'bg_number': 'BG-2026-010',
                'amount_of_bg': Decimal('600000.00'),
                'issue_date': date(2026, 5, 10),
                'expiry_date': today - timedelta(days=5),  # Already expired!
                'cheque_number': 'CHQ-010123',
                'date_of_issue_of_cheque': date(2026, 5, 8),
                'bank_name_of_cheque': 'Punjab National Bank',
                'account_no_of_cheque': '20345678901',
            },
        ]

        for record in records:
            BankGuarantee.objects.create(**record)

        self.stdout.write(f'  Created {BankGuarantee.objects.count()} Bank Guarantee records')
