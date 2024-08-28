# Generated by Django 5.0.7 on 2024-08-20 17:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('category', models.CharField(choices=[('asset', 'Asset'), ('liability', 'Liabilities'), ('income', 'Income'), ('expense', 'Expense'), ('capital', 'Capital')], max_length=200)),
                ('sub_category', models.CharField(choices=[('current_asset', 'Current Asset'), ('non-current_asset', 'Non-current Asset'), ('current_liability', 'Current Liability'), ('long-term_loan', 'Long-Term Liability'), ('capital', 'Capital'), ('indirect_expense', 'Indirect Expense'), ('cost_of_goods_sold', 'Cost of Goods Sold'), ('sales_revenue', 'Sales Revenue'), ('indirect_income', 'Indirect Income')], max_length=200)),
                ('opening_balance', models.DecimalField(blank=True, decimal_places=2, max_digits=15, null=True)),
                ('opening_balance_type', models.CharField(blank=True, choices=[('debit', 'Debit'), ('credit', 'Credit')], max_length=200, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Journal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('description', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('unit_name', models.CharField(max_length=200)),
                ('unit_alias', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('phone_number', models.IntegerField()),
                ('account', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='customer', to='journals.account')),
            ],
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('paid', 'Paid'), ('partially_paid', 'Partially_paid'), ('unpaid', 'Unpaid')], max_length=200)),
                ('due_date', models.DateField()),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_due', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_paid', models.DecimalField(decimal_places=2, default=0.0, max_digits=15)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='journals.customer')),
                ('journal', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='journals.journal')),
            ],
        ),
        migrations.CreateModel(
            name='Bill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('paid', 'Paid'), ('partially_paid', 'Partially_paid'), ('unpaid', 'Unpaid')], max_length=200)),
                ('due_date', models.DateField()),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_due', models.DecimalField(decimal_places=2, max_digits=15)),
                ('amount_paid', models.DecimalField(decimal_places=2, default=0.0, max_digits=15)),
                ('journal', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bill', to='journals.journal')),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('amount_paid', models.DecimalField(decimal_places=2, max_digits=15)),
                ('bill', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='journals.bill')),
                ('invoice', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='journals.invoice')),
            ],
        ),
        migrations.CreateModel(
            name='Purchase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase', to='journals.account')),
            ],
        ),
        migrations.AddField(
            model_name='bill',
            name='purchase',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='bill', to='journals.purchase'),
        ),
        migrations.CreateModel(
            name='PurchaseEntries',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purchased_quantity', models.IntegerField()),
                ('remaining_quantity', models.IntegerField()),
                ('purchase_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, max_digits=15)),
                ('purchase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_entries', to='journals.purchase')),
                ('stock', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_entries', to='journals.stock')),
            ],
        ),
        migrations.CreateModel(
            name='PurchaseReturn',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_return', to='journals.account')),
                ('purchase', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='purchase_return', to='journals.purchase')),
            ],
        ),
        migrations.CreateModel(
            name='PurchaseReturnEntries',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('return_quantity', models.IntegerField()),
                ('purchase_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, max_digits=15)),
                ('purchase_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.purchaseentries')),
                ('purchase_return', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.purchasereturn')),
            ],
        ),
        migrations.CreateModel(
            name='Sales',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales', to='journals.account')),
            ],
        ),
        migrations.AddField(
            model_name='invoice',
            name='sales',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='invoice', to='journals.sales'),
        ),
        migrations.CreateModel(
            name='SalesEntries',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('initial_quantity', models.IntegerField()),
                ('sold_quantity', models.IntegerField()),
                ('sales_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, default=0, max_digits=15)),
                ('sales', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_entries', to='journals.sales')),
                ('stock', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_entries', to='journals.stock')),
            ],
        ),
        migrations.CreateModel(
            name='SalesPurchasePrice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('purchase_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('sales_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('initial_quantity', models.IntegerField()),
                ('sold_quantity', models.IntegerField()),
                ('purchase_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_purchases_price', to='journals.purchaseentries')),
                ('sales_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_purchase_price', to='journals.salesentries')),
            ],
        ),
        migrations.CreateModel(
            name='SalesReturn',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('description', models.TextField()),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_return', to='journals.account')),
                ('sales', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sales_return', to='journals.sales')),
            ],
        ),
        migrations.CreateModel(
            name='JournalEntries',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
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
        ),
        migrations.CreateModel(
            name='SalesReturnEntries',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('return_quantity', models.IntegerField()),
                ('sales_price', models.DecimalField(decimal_places=2, max_digits=15)),
                ('cogs', models.DecimalField(decimal_places=2, max_digits=15)),
                ('sales_entry', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.salesentries')),
                ('sales_return', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='return_entries', to='journals.salesreturn')),
            ],
        ),
        migrations.CreateModel(
            name='Supplier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('email', models.EmailField(max_length=254)),
                ('phone_number', models.IntegerField()),
                ('account', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='supplier', to='journals.account')),
            ],
        ),
        migrations.AddField(
            model_name='bill',
            name='supplier',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bill', to='journals.supplier'),
        ),
    ]
