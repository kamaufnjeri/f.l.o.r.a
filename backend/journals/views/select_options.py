from rest_framework import generics, status, serializers
from rest_framework.response import Response
from journals.utils import flatten_errors, serial_numbers
from journals.models import Account, Supplier, Customer, Stock, SubCategory, Category, FixedGroup, Service
from rest_framework.permissions import IsAuthenticated
from journals.permissions import IsUserInOrganisation
from journals.serializers import CustomerSerializer, SupplierSerializer, StockSerializer, AccountSerializer, SubCategorySerializer
from journals.serializers import CategorySerializer, FixedGroupSerializer, ServiceSerializer


class SelectOptionsAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsUserInOrganisation]

    def get(self, request, *args, **kwargs):
        try:
            organisation = request.user.current_org
            accounts = Account.objects.filter(organisation=organisation)
            stocks = Stock.objects.filter(organisation=organisation)
            suppliers = Supplier.objects.filter(organisation=organisation)
            customers = Customer.objects.filter(organisation=organisation)
            sub_categories = SubCategory.objects.filter(category__organisation=organisation)
            categories = Category.objects.filter(organisation=organisation)
            fixed_groups = FixedGroup.objects.all()
            services = Service.objects.filter(organisation=organisation)

            accounts_data = AccountSerializer(accounts, many=True).data
            stocks_data = StockSerializer(stocks, many=True).data
            suppliers_data = SupplierSerializer(suppliers, many=True).data
            customers_data = CustomerSerializer(customers, many=True).data
            categories_data = CategorySerializer(categories, many=True).data
            sub_categories_data = SubCategorySerializer(sub_categories, many=True).data
            fixed_groups_data = FixedGroupSerializer(fixed_groups, many=True).data
            services_data = ServiceSerializer(services, many=True).data

            payments_accounts = []
            income_accounts = []
            expense_accounts = []
            accounts_new_data = []
            for account in accounts_data:
                account_name = f"{account.get('name')} (bal-{account.get('account_balance')})"
                account_data = {"id": account.get("id"), "name": account_name}
                group = account.get('group')
                sub_category = account.get("sub_category")
                if group == 'Expense':
                    expense_accounts.append(account_data)
                if group == 'Income':
                    income_accounts.append(account_data)
                if sub_category == 'Cash and Cash Equivalents':
                    payments_accounts.append(account_data)
                accounts_new_data.append(account_data)

            stocks_new_data = []
            for stock in stocks_data:
                stock_name = f"{stock.get('name')} (aval-{stock.get('total_quantity')}{stock.get('unit_alias')})"
                stock_data = {"id": stock.get("id"), "name": stock_name}
                stocks_new_data.append(stock_data)

            serial_numbers_data = serial_numbers.get_serial_numbers(organisation)
            response_data = {
                "suppliers": suppliers_data,
                "customers": customers_data,
                "stocks": stocks_new_data,
                "accounts": accounts_new_data,
                "payment_accounts": payments_accounts,
                "income_accounts": income_accounts,
                "expense_accounts": expense_accounts,
                "serial_numbers": serial_numbers_data,
                "fixed_groups": fixed_groups_data,
                "categories": categories_data,
                "sub_categories": sub_categories_data,
                "services": services_data
            }


            return Response(response_data, status=status.HTTP_200_OK)
        
        except serializers.ValidationError as e:
            errors = flatten_errors(e.detail)
            return Response({
                'error': 'Bad Request',
                'details': errors
            }, status=status.HTTP_400_BAD_REQUEST)
       