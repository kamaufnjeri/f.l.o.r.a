from datetime import datetime, timedelta
from django.db.models import Q

class ServiceUtils:
    def __init__(self, service, period=None):
        self.service = service
        self.period = period

    def get_opening_balance(self):
        start_date = self.get_start_date()

        _, total_amount = self.get_service_income_entries(before_date=start_date)

        
        
        return {
            'details': {
                'date': start_date,
                'description': 'Opening balance',
                'type': 'Opening balance',
                'total': total_amount
            }
            
        }, total_amount
       


    def get_service_data(self):
        service_data = self.get_sorted_service_income_entries()
        return service_data

    def get_service_income_date_description_type(self, service_income):
        if service_income.journal:
            return service_income.journal.date, service_income.journal.description, 'Journal'
        elif service_income.sales:
            return service_income.sales.date, service_income.sales.description, 'Sales'
        elif service_income.service_income:
            return service_income.service_income.date, service_income.service_income.description, 'Service Income'
        else:
            return self.get_start_date(), 'Default', 'Default'
        

    def get_service_income_entries(self, before_date=None, after_date=None):
        from journals.serializers import DetailedServiceIncomeEntrySerializer


        service_income_entries = self.service.service_income_entries.all()

        if before_date:
            service_income_entries = service_income_entries.filter(
                (Q(service_income__date__lt=before_date) & Q(service_income__date__isnull=False))
            )

        if after_date:
            service_income_entries = service_income_entries.filter(
                (Q(service_income__date__gte=after_date) & Q(service_income__date__isnull=False))
            )

        entries_serializer_data = DetailedServiceIncomeEntrySerializer(service_income_entries, many=True).data

        total_amount = sum(entry.get('details').get('total') for entry in entries_serializer_data)

        return entries_serializer_data, total_amount
       

        return 
    
    def get_service_income_entries_data(self):
        start_date = self.get_start_date()
        end_date = self.get_end_date() + timedelta(days=1)

        entries, total_amount = self.get_service_income_entries(after_date=start_date, before_date=end_date)

        return entries, total_amount

    def get_start_date(self):
        
        today = datetime.today().date()
        if self.period:
            if self.period == 'today':
                return today
            elif self.period == 'yesterday':
                return today - timedelta(days=1)
            elif self.period == 'this_week':
                return today - timedelta(days=today.weekday())
            elif self.period == 'this_month':
                return today.replace(day=1)
            elif isinstance(self.period, str) and 'to' in self.period:

                start_date_str = self.period.split('to')[0]
                return datetime.strptime(start_date_str, "%Y-%m-%d").date()
            else:
                return self.service.created_at.date()
        else:
            return self.service.created_at.date()

    def get_end_date(self):
       
        today = datetime.today().date()
        if self.period:
            if self.period == 'today':
                return today
            elif self.period == 'yesterday':
                return today - timedelta(days=1)
            elif self.period == 'this_week':
                return today
            elif self.period == 'this_month':
                return today
            elif 'to' in self.period:
                end_date_str = self.period.split('to')[1]
                return datetime.strptime(end_date_str, "%Y-%m-%d").date()
                
            else:
                return today
        else:
            return today

    def get_sorted_service_income_entries(self):
        opening_details, opening_total_amount  = self.get_opening_balance()
        service_income_entries, total_amount = self.get_service_income_entries_data()

        sorted_service_income_entries = sorted(service_income_entries, key=lambda x: x.get('details').get('date'))

        if opening_details:
            sorted_service_income_entries.insert(0, opening_details)
            total_amount += opening_total_amount


        return {
            'entries': sorted_service_income_entries,
            "total": total_amount
        }

    

    