# Generated by Django 5.0.7 on 2024-09-04 14:00

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=200)),
                ('group', models.CharField(choices=[('asset', 'Asset'), ('liability', 'Liability'), ('capital', 'Capital'), ('expense', 'Expense'), ('income', 'Income')], max_length=200)),
                ('category', models.CharField(choices=[('current_asset', 'Current Asset'), ('non_current_asset', 'Non-current Asset'), ('current_liability', 'Current Liability'), ('long_term_liability', 'Long-term Liability'), ('owner_equity', 'Owner Equity'), ('other_equity', 'Other Equity'), ('operating_expenses', 'Operating Expenses'), ('cost_of_goods_sold', 'Cost of Goods Sold'), ('sales_revenue', 'Sales Revenue'), ('other_income', 'Other Income')], max_length=200)),
                ('sub_category', models.CharField(choices=[('cash_and_cash_equivalents', 'Cash and Cash Equivalents'), ('accounts_receivable', 'Accounts Receivable'), ('inventory', 'Inventory'), ('property_plant_equipment', 'Property, Plant, and Equipment'), ('intangible_assets', 'Intangible Assets'), ('accounts_payable', 'Accounts Payable'), ('short_term_loans', 'Short-term Loans'), ('long_term_loans', 'Long-term Loans'), ('mortgage_payable', 'Mortgage Payable'), ('retained_earnings', 'Retained Earnings'), ('owner_investment', 'Owner Investment'), ('additional_contributions', 'Additional Contributions'), ('drawings', 'Drawings'), ('equity_from_loans', 'Equity from Loans'), ('subordinated_debt', 'Subordinated Debt'), ('rent_and_utilities', 'Rent and Utilities'), ('salaries_and_wages', 'Salaries and Wages'), ('marketing_and_advertising', 'Marketing and Advertising'), ('cost_of_goods_sold', 'Cost of Goods Sold'), ('product_sales', 'Product Sales'), ('service_revenue', 'Service Revenue'), ('interest_income', 'Interest Income'), ('investment_income', 'Investment Income')], max_length=200)),
                ('opening_balance', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True)),
                ('opening_balance_type', models.CharField(blank=True, choices=[('debit', 'Debit'), ('credit', 'Credit')], max_length=200, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Journal',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('description', models.TextField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Purchase',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('description', models.TextField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Sales',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('description', models.TextField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=200)),
                ('unit_name', models.CharField(max_length=200)),
                ('unit_alias', models.CharField(max_length=200)),
                ('opening_stock_quantity', models.IntegerField(blank=True, default=0)),
                ('opening_stock_rate', models.DecimalField(decimal_places=2, default=0.0, max_digits=15)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('phone_number', models.IntegerField()),
                ('account', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='customer', to='journals.account')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('paid', 'Paid'), ('partially_paid', 'Partially_paid'), ('unpaid', 'Unpaid')], max_length=200)),
                ('due_date', models.DateField()),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_due', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_paid', models.DecimalField(decimal_places=2, default=0.0, max_digits=15)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='journals.customer')),
                ('journal', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='journals.journal')),
                ('sales', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='journals.sales')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Bill',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('paid', 'Paid'), ('partially_paid', 'Partially_paid'), ('unpaid', 'Unpaid')], max_length=200)),
                ('due_date', models.DateField()),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_due', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_paid', models.DecimalField(decimal_places=2, default=0.0, max_digits=15)),
                ('journal', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bill', to='journals.journal')),
                ('purchase', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bill', to='journals.purchase')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('amount_paid', models.DecimalField(decimal_places=2, max_digits=15)),
                ('bill', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='journals.bill')),
                ('invoice', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='journals.invoice')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PurchaseEntries',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('purchased_quantity', models.IntegerField()),
                ('remaining_quantity', models.IntegerField()),
                ('purchase_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, max_digits=15)),
                ('purchase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_entries', to='journals.purchase')),
                ('stock', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_entries', to='journals.stock')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PurchaseReturn',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_return', to='journals.account')),
                ('purchase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_return', to='journals.purchase')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PurchaseReturnEntries',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('return_quantity', models.IntegerField()),
                ('purchase_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, max_digits=15)),
                ('purchase_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.purchaseentries')),
                ('purchase_return', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.purchasereturn')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Discount',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('discount_type', models.CharField(choices=[('purchase', 'Purchase'), ('sales', 'Sales')], max_length=120)),
                ('discount_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('discount_amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('purchase', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='discount_received', to='journals.purchase')),
                ('sales', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='discount_allowed', to='journals.sales')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SalesEntries',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('initial_quantity', models.IntegerField()),
                ('sold_quantity', models.IntegerField()),
                ('sales_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, default=0, max_digits=15)),
                ('sales', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_entries', to='journals.sales')),
                ('stock', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_entries', to='journals.stock')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SalesPurchasePrice',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('purchase_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('sales_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('initial_quantity', models.IntegerField()),
                ('sold_quantity', models.IntegerField()),
                ('purchase_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_purchases_price', to='journals.purchaseentries')),
                ('sales_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_purchase_price', to='journals.salesentries')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SalesReturn',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_return', to='journals.account')),
                ('sales', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_return', to='journals.sales')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='JournalEntries',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('amount', models.DecimalField(decimal_places=2, default=0.0, max_digits=15)),
                ('debit_credit', models.CharField(choices=[('debit', 'Debit'), ('credit', 'Credit')], max_length=200)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='journals.account')),
                ('journal', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='journals.journal')),
                ('payments', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='journals.payment')),
                ('purchase', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='journals.purchase')),
                ('purchase_return', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='journals.purchasereturn')),
                ('sales', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='journals.sales')),
                ('sales_return', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='journal_entries', to='journals.salesreturn')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SalesReturnEntries',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('return_quantity', models.IntegerField()),
                ('sales_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, max_digits=15)),
                ('sales_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.salesentries')),
                ('sales_return', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.salesreturn')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Supplier',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('phone_number', models.IntegerField()),
                ('account', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='supplier', to='journals.account')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='bill',
            name='supplier',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bill', to='journals.supplier'),
        ),
    ]
