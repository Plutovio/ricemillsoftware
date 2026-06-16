from django.core.management.base import BaseCommand
from apps.bank_guarantee.models import DropdownOption, BankGuarantee
from django.contrib.auth.models import User
from decimal import Decimal
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seed the database with realistic Bank Guarantee data and dropdown options'

    def handle(self, *args, **options):
        self.stdout.write('Seeding dropdown options...')
        self._seed_dropdowns()
        self.stdout.write('Seeding default operator user...')
        self._seed_user()
        self.stdout.write('Seeding Bank Guarantee records...')
        self._seed_bank_guarantees()
        self.stdout.write(self.style.SUCCESS('Successfully seeded database!'))

    def _seed_dropdowns(self):
        # Only seed if no options exist
        if DropdownOption.objects.exists():
            self.stdout.write('  Dropdown options already exist, skipping seeding.')
            return

        # Bank Names
        banks = ['State Bank of India', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank']
        for bank in banks:
            DropdownOption.objects.create(category='bank_name', value=bank)

        # Branch Names with real IFSC codes
        branches = [
            ('SBI Main Branch, Delhi', {'ifsc': 'SBIN0000625'}),
            ('SBI Industrial Area, Chandigarh', {'ifsc': 'SBIN0001815'}),
            ('PNB Sector 17, Chandigarh', {'ifsc': 'PUNB0017100'}),
            ('PNB Civil Lines, Delhi', {'ifsc': 'PUNB0010800'}),
            ('BOB Grain Market, Karnal', {'ifsc': 'BARB0KARNAL'}),
            ('BOB GT Road, Panipat', {'ifsc': 'BARB0PANIPA'}),
            ('Canara Bank Mandi Gobindgarh', {'ifsc': 'CNRB0000282'}),
            ('Canara Bank Rajpura', {'ifsc': 'CNRB0000371'}),
        ]
        for branch, meta in branches:
            DropdownOption.objects.create(category='branch_name', value=branch, meta=meta)

        # Departments
        departments = ['Procurement', 'Operations', 'Logistics', 'Accounts']
        for dept in departments:
            DropdownOption.objects.create(category='department', value=dept)

        # Debit Account Numbers (for debiting company expenses/guarantees)
        debit_accounts = [
            '10234567890', '20345678901', '30456789012',
            '40567890123', '50678901234', '60789012345',
        ]
        for acc in debit_accounts:
            DropdownOption.objects.create(category='debit_account_no', value=acc)

        # Cheque Account Numbers
        cheque_accounts = ['10234567890', '20345678901', '30456789012', '40567890123']
        for acc in cheque_accounts:
            DropdownOption.objects.create(category='account_no_of_cheque', value=acc)

        self.stdout.write(f'  Created {DropdownOption.objects.count()} dropdown options')

    def _seed_user(self):
        # Create a default operator account if it doesn't exist
        if not User.objects.filter(username='operator').exists():
            User.objects.create_user(
                username='operator',
                email='operator@ricemill.com',
                password='password123'
            )
            self.stdout.write('  Created default user: operator / password123')
        else:
            # Ensure the password matches password123 if user already exists
            user = User.objects.get(username='operator')
            user.set_password('password123')
            user.save()
            self.stdout.write('  Reset default user password to password123')

    def _seed_bank_guarantees(self):
        # Only seed if no guarantees exist
        if BankGuarantee.objects.exists():
            self.stdout.write('  Bank Guarantees already exist, skipping seeding.')
            return

        today = date.today()

        records = [
            {
                'bank_name': 'State Bank of India',
                'branch_name': 'SBI Main Branch, Delhi',
                'ifsc_code': 'SBIN0000625',
                'debit_account_no': '10234567890',
                'bg_account_no': 'BGACC-1001',
                'payment_mode': 'cheque',
                'department': 'Procurement',
                'bg_number': 'BG-2026-001',
                'amount_of_bg': Decimal('500000.00'),
                'issue_date': date(2026, 1, 15),
                'expiry_date': date(2026, 7, 15),
                'cheque_number': 'CHQ-001234',
                'date_of_issue_of_cheque': date(2026, 1, 10),
                'bank_name_of_cheque': 'State Bank of India',
                'account_no_of_cheque': '10234567890',
                'pdc_cheque_number': 'PDC-991001',
                'pdc_date_of_issue_of_cheque': date(2026, 1, 12),
                'pdc_bank_name_of_cheque': 'State Bank of India',
                'pdc_account_no_of_cheque': '10234567890',
            },
            {
                'bank_name': 'Punjab National Bank',
                'branch_name': 'PNB Sector 17, Chandigarh',
                'ifsc_code': 'PUNB0017100',
                'debit_account_no': '20345678901',
                'bg_account_no': 'BGACC-1002',
                'payment_mode': 'cheque',
                'department': 'Operations',
                'bg_number': 'BG-2026-002',
                'amount_of_bg': Decimal('750000.00'),
                'issue_date': date(2026, 2, 1),
                'expiry_date': date(2026, 8, 1),
                'cheque_number': 'CHQ-002345',
                'date_of_issue_of_cheque': date(2026, 1, 28),
                'bank_name_of_cheque': 'Punjab National Bank',
                'account_no_of_cheque': '20345678901',
                'pdc_cheque_number': 'PDC-991002',
                'pdc_date_of_issue_of_cheque': date(2026, 1, 30),
                'pdc_bank_name_of_cheque': 'Punjab National Bank',
                'pdc_account_no_of_cheque': '20345678901',
            },
            {
                'bank_name': 'Bank of Baroda',
                'branch_name': 'BOB Grain Market, Karnal',
                'ifsc_code': 'BARB0KARNAL',
                'debit_account_no': '30456789012',
                'bg_account_no': 'BGACC-1003',
                'payment_mode': 'online',
                'department': 'Logistics',
                'bg_number': 'BG-2026-003',
                'amount_of_bg': Decimal('1000000.00'),
                'issue_date': date(2026, 3, 10),
                'expiry_date': date(2026, 9, 10),
                'online_transaction_id': 'TXN-OB88123',
                'online_transaction_date': date(2026, 3, 8),
                'online_payment_mode': 'RTGS',
                'online_bank_name': 'HDFC Bank',
                'pdc_cheque_number': 'PDC-991003',
                'pdc_date_of_issue_of_cheque': date(2026, 3, 8),
                'pdc_bank_name_of_cheque': 'Bank of Baroda',
                'pdc_account_no_of_cheque': '30456789012',
            },
            {
                'bank_name': 'Canara Bank',
                'branch_name': 'Canara Bank Mandi Gobindgarh',
                'ifsc_code': 'CNRB0000282',
                'debit_account_no': '40567890123',
                'bg_account_no': 'BGACC-1004',
                'payment_mode': 'cheque',
                'department': 'Accounts',
                'bg_number': 'BG-2026-004',
                'amount_of_bg': Decimal('250000.00'),
                'issue_date': date(2026, 4, 1),
                'expiry_date': today + timedelta(days=15),  # Expiring soon!
                'cheque_number': 'CHQ-004567',
                'date_of_issue_of_cheque': date(2026, 3, 28),
                'bank_name_of_cheque': 'Canara Bank',
                'account_no_of_cheque': '30456789012',
                'pdc_cheque_number': 'PDC-991004',
                'pdc_date_of_issue_of_cheque': date(2026, 3, 30),
                'pdc_bank_name_of_cheque': 'Canara Bank',
                'pdc_account_no_of_cheque': '30456789012',
            },
            {
                'bank_name': 'State Bank of India',
                'branch_name': 'SBI Industrial Area, Chandigarh',
                'ifsc_code': 'SBIN0001815',
                'debit_account_no': '50678901234',
                'bg_account_no': 'BGACC-1005',
                'payment_mode': 'cheque',
                'department': 'Procurement',
                'bg_number': 'BG-2026-005',
                'amount_of_bg': Decimal('1500000.00'),
                'issue_date': date(2026, 1, 1),
                'expiry_date': today + timedelta(days=25),  # Expiring soon!
                'cheque_number': 'CHQ-005678',
                'date_of_issue_of_cheque': date(2025, 12, 28),
                'bank_name_of_cheque': 'State Bank of India',
                'account_no_of_cheque': '10234567890',
                'pdc_cheque_number': 'PDC-991005',
                'pdc_date_of_issue_of_cheque': date(2025, 12, 30),
                'pdc_bank_name_of_cheque': 'State Bank of India',
                'pdc_account_no_of_cheque': '10234567890',
            },
            {
                'bank_name': 'Punjab National Bank',
                'branch_name': 'PNB Civil Lines, Delhi',
                'ifsc_code': 'PUNB0010800',
                'debit_account_no': '60789012345',
                'bg_account_no': 'BGACC-1006',
                'payment_mode': 'online',
                'department': 'Operations',
                'bg_number': 'BG-2026-006',
                'amount_of_bg': Decimal('300000.00'),
                'issue_date': date(2026, 5, 1),
                'expiry_date': date(2026, 11, 1),
                'online_transaction_id': 'TXN-OB99876',
                'online_transaction_date': date(2026, 4, 28),
                'online_payment_mode': 'NEFT',
                'online_bank_name': 'Punjab National Bank',
                'pdc_cheque_number': 'PDC-991006',
                'pdc_date_of_issue_of_cheque': date(2026, 4, 30),
                'pdc_bank_name_of_cheque': 'Punjab National Bank',
                'pdc_account_no_of_cheque': '20345678901',
            },
            {
                'bank_name': 'Bank of Baroda',
                'branch_name': 'BOB GT Road, Panipat',
                'ifsc_code': 'BARB0PANIPA',
                'debit_account_no': '10234567890',
                'bg_account_no': 'BGACC-1007',
                'payment_mode': 'cheque',
                'department': 'Logistics',
                'bg_number': 'BG-2026-007',
                'amount_of_bg': Decimal('800000.00'),
                'issue_date': date(2026, 3, 15),
                'expiry_date': today + timedelta(days=5),  # Expiring very soon!
                'cheque_number': 'CHQ-007890',
                'date_of_issue_of_cheque': date(2026, 3, 10),
                'bank_name_of_cheque': 'Bank of Baroda',
                'account_no_of_cheque': '20345678901',
                'pdc_cheque_number': 'PDC-991007',
                'pdc_date_of_issue_of_cheque': date(2026, 3, 12),
                'pdc_bank_name_of_cheque': 'Bank of Baroda',
                'pdc_account_no_of_cheque': '20345678901',
            },
            {
                'bank_name': 'Canara Bank',
                'branch_name': 'Canara Bank Rajpura',
                'ifsc_code': 'CNRB0000371',
                'debit_account_no': '20345678901',
                'bg_account_no': 'BGACC-1008',
                'payment_mode': 'cheque',
                'department': 'Accounts',
                'bg_number': 'BG-2026-008',
                'amount_of_bg': Decimal('450000.00'),
                'issue_date': date(2026, 2, 15),
                'expiry_date': date(2026, 8, 15),
                'cheque_number': 'CHQ-008901',
                'date_of_issue_of_cheque': date(2026, 2, 12),
                'bank_name_of_cheque': 'Canara Bank',
                'account_no_of_cheque': '40567890123',
                'pdc_cheque_number': 'PDC-991008',
                'pdc_date_of_issue_of_cheque': date(2026, 2, 14),
                'pdc_bank_name_of_cheque': 'Canara Bank',
                'pdc_account_no_of_cheque': '40567890123',
            },
            {
                'bank_name': 'State Bank of India',
                'branch_name': 'SBI Main Branch, Delhi',
                'ifsc_code': 'SBIN0000625',
                'debit_account_no': '30456789012',
                'bg_account_no': 'BGACC-1009',
                'payment_mode': 'cheque',
                'department': 'Procurement',
                'bg_number': 'BG-2026-009',
                'amount_of_bg': Decimal('2000000.00'),
                'issue_date': date(2026, 4, 20),
                'expiry_date': date(2026, 10, 20),
                'cheque_number': 'CHQ-009012',
                'date_of_issue_of_cheque': date(2026, 4, 18),
                'bank_name_of_cheque': 'State Bank of India',
                'account_no_of_cheque': '10234567890',
                'pdc_cheque_number': 'PDC-991009',
                'pdc_date_of_issue_of_cheque': date(2026, 4, 19),
                'pdc_bank_name_of_cheque': 'State Bank of India',
                'pdc_account_no_of_cheque': '10234567890',
            },
            {
                'bank_name': 'Punjab National Bank',
                'branch_name': 'PNB Sector 17, Chandigarh',
                'ifsc_code': 'PUNB0017100',
                'debit_account_no': '40567890123',
                'bg_account_no': 'BGACC-1010',
                'payment_mode': 'online',
                'department': 'Operations',
                'bg_number': 'BG-2026-010',
                'amount_of_bg': Decimal('600000.00'),
                'issue_date': date(2026, 5, 10),
                'expiry_date': today - timedelta(days=5),  # Already expired!
                'online_transaction_id': 'TXN-OB99321',
                'online_transaction_date': date(2026, 5, 8),
                'online_payment_mode': 'UPI',
                'online_bank_name': 'Punjab National Bank',
                'pdc_cheque_number': 'PDC-991010',
                'pdc_date_of_issue_of_cheque': date(2026, 5, 8),
                'pdc_bank_name_of_cheque': 'Punjab National Bank',
                'pdc_account_no_of_cheque': '20345678901',
            },
        ]

        for record in records:
            BankGuarantee.objects.create(**record)

        self.stdout.write(f'  Created {BankGuarantee.objects.count()} Bank Guarantee records')
