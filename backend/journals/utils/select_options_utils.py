from journals.models import Account, Stock, SubCategory, Category, FixedGroup, Service
from journals.serializers import  StockSerializer, AccountSerializer, SubCategorySerializer
from journals.serializers import CategorySerializer, FixedGroupSerializer, ServiceSerializer
from .get_serial_number import serial_numbers

class SelectOptions:
    def get_select_options(self, organisation):
        accounts = Account.objects.filter(organisation=organisation)
        stocks = Stock.objects.filter(organisation=organisation)
        sub_categories = SubCategory.objects.filter(category__organisation=organisation)
        categories = Category.objects.filter(organisation=organisation)
        fixed_groups = FixedGroup.objects.all()
        services = Service.objects.filter(organisation=organisation)

        accounts_data = AccountSerializer(accounts, many=True).data
        stocks_data = StockSerializer(stocks, many=True).data
        categories_data = CategorySerializer(categories, many=True).data
        sub_categories_data = SubCategorySerializer(sub_categories, many=True).data
        fixed_groups_data = FixedGroupSerializer(fixed_groups, many=True).data
        services_data = ServiceSerializer(services, many=True).data

        # payments_accounts = []
        # purchase_accounts = []
        accounts_new_data = []
        suppliers_accounts = []
        customers_accounts = []
        # income_discount_accounts = []
        # expense_discount_accounts = []
        # sales_accounts = []
        # service_income_accounts = []
        
        for account in accounts_data:
            bal_type = ''
            if account.get('group') in ('Asset', 'Expense'):
                bal_type = 'Dr'
            else:
                bal_type = 'Cr'
            account_name = f"{account.get('name')} ({bal_type})"
            sub_category = account.get("sub_category")

            account_data = {"id": account.get("id"), "name": f"{account_name} ({account.get('account_balance')})", "sub_category": sub_category}
            
            
            accounts_new_data.append(account_data)

        stocks_new_data = []
        for stock in stocks_data:
            stock_name = f"{stock.get('name')} ({stock.get('total_quantity')} {stock.get('unit_alias')})"
            stock_data = {"id": stock.get("id"), "name": stock_name}
            stocks_new_data.append(stock_data)

        serial_numbers_data = serial_numbers.get_serial_numbers(organisation)
        response_data = {
            "suppliers_accounts": suppliers_accounts,
            "customers_accounts": customers_accounts,
            "stocks": stocks_new_data,
            "accounts": accounts_new_data,
            "serial_numbers": serial_numbers_data,
            "fixed_groups": fixed_groups_data,
            "categories": categories_data,
            "sub_categories": sub_categories_data,
            "services": services_data
        }


        return response_data
    
    def get_specific_select_options(self, organisation, add_accounts=True, add_stocks=False, add_serial_no=True, add_services=True, add_categories=True, add_sub_categories=True):
        response_data = {}

        if add_accounts:
            accounts = Account.objects.filter(organisation=organisation)
            accounts_data = AccountSerializer(accounts, many=True).data

            accounts_new_data = []

            for account in accounts_data:
                bal_type = ''
                if account.get('group') in ('Asset', 'Expense'):
                    bal_type = 'Dr'
                else:
                    bal_type = 'Cr'

                account_name = f"{account.get('name')} ({bal_type})"
                sub_category = account.get("sub_category")

                account_data = {
                    "id": account.get("id"),
                    "name": f"{account_name} ({account.get('account_balance')})",
                    "sub_category": sub_category
                }

                accounts_new_data.append(account_data)
            

            response_data["accounts"] = accounts_new_data

        if add_stocks:
            stocks = Stock.objects.filter(organisation=organisation)
            stocks_data = StockSerializer(stocks, many=True).data

            stocks_new_data = []

            for stock in stocks_data:
                stock_name = f"{stock.get('name')} ({stock.get('total_quantity')} {stock.get('unit_alias')})"

                stock_data = {
                    "id": stock.get("id"),
                    "name": stock_name
                }

                stocks_new_data.append(stock_data)

            response_data["stocks"] = stocks_new_data
        if add_serial_no:
            serial_numbers_data = serial_numbers.get_serial_numbers(organisation)
            response_data["serial_numbers"] = serial_numbers_data
        if add_services:
            services = Service.objects.filter(organisation=organisation)
            services_data = ServiceSerializer(services, many=True).data
            response_data["services"] = services_data
        if add_categories:
            categories = Category.objects.filter(organisation=organisation)

            categories_data = CategorySerializer(categories, many=True).data
            response_data["categories"] = categories_data

        if add_sub_categories:
            sub_categories = SubCategory.objects.filter(category__organisation=organisation)

            sub_categories_data = SubCategorySerializer(sub_categories, many=True).data
            response_data["sub_categories"] = sub_categories_data

        return response_data



select_options = SelectOptions()