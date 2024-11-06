from journals.models import Journal, Sales, Purchase, Invoice, Bill, ServiceIncome


class SerialNumbers:
    def get_serial_number(self, items, initial_name, items_length):
        number = items_length + 1
        serial_number = f'{initial_name}-{number}'
        for item in items:
            if item.serial_number == serial_number:
                serial_number = self.get_serial_number(items, initial_name, items_length + 1)
        return serial_number
    
    def get_serial_numbers(self, organisation):
        journals = Journal.objects.filter(organisation=organisation)
        purchases  = Purchase.objects.filter(organisation=organisation)
        sales =  Sales.objects.filter(organisation=organisation)
        invoices =  Invoice.objects.filter(organisation=organisation)
        bills =  Bill.objects.filter(organisation=organisation)
        service_income = ServiceIncome.objects.filter(organisation=organisation)

        journal_serial_no = self.get_serial_number(journals, 'JOURN', len(journals))
        sales_serial_no = self.get_serial_number(sales, 'SALE', len(sales))
        purchase_serial_no = self.get_serial_number(purchases, 'PURCH', len(purchases))
        invoice_serial_no = self.get_serial_number(invoices, 'INV', len(invoices))
        bill_serial_no = self.get_serial_number(bills, 'BILL', len(bills))
        service_income_serial_no = self.get_serial_number(service_income, 'SERV', len(service_income))

        serial_numbers = {
            "journal": journal_serial_no,
            "sales": sales_serial_no,
            "purchase": purchase_serial_no,
            "bill": bill_serial_no,
            "invoice": invoice_serial_no,
            "service_income": service_income_serial_no
        }

        return serial_numbers

            
serial_numbers = SerialNumbers()