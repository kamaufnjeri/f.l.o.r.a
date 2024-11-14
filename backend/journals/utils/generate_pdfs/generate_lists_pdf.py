from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from datetime import datetime, timedelta
import io
import os

class GenerateListsPDF:
    def __init__(self, title, user, data, filters, filename):
        self.title = title
        self.data = data
        self.filters = filters
        self.organisation = user.current_org
        self.user = user
        self.author = 'F.L.O.R.A'
        self.author_full = "Financial Ledgers and Operations Report Analysis"
        self.template_path = os.path.join(os.path.dirname(__file__), '../templates')
        self.css_path = f"{self.template_path}/static/styles.css"
        self.template_filename = filename 
        self.logo_path = './images/logo.png'
        self.generated_date = datetime.today().date()
        self.generated_time = datetime.today().strftime("%I:%M %p")

    def create_pdf(self):
        """Generate the PDF using the HTML template and xhtml2pdf."""
        # Load the HTML template using Jinja2
        env = Environment(loader=FileSystemLoader(self.template_path))
        template = env.get_template(self.template_filename)

        title = self.title
        if len(self.get_search_filters().keys()) > 1:
            title = f'Filtered {self.title}'

        context = {
            'report_title': title,
            'organisation': self.organisation,
            'user': self.user,
            'author_full': self.author_full,
            'logo_path': self.logo_path,
            'search_filters': self.get_search_filters(),
            'data': self.data,
            'date': self.generated_date,
            'time': self.generated_time,
            "css_path": self.css_path
        }

        html_content = template.render(context)

        pdf_output = self.generate_pdf_from_html(html_content)
        return pdf_output

    def generate_pdf_from_html(self, html_content):
        """Convert HTML content to PDF using xhtml2pdf."""
        pdf_output = io.BytesIO()
        pisa_status = pisa.CreatePDF(io.StringIO(html_content), dest=pdf_output)

        if pisa_status.err:
            print("Error generating PDF")
        pdf_output.seek(0)
        return pdf_output

    
    def get_search_filters(self):
        from collections import OrderedDict
        
        new_filters = OrderedDict()

        if self.filters and 'date' in self.filters and self.filters['date']:
            new_filters['Period'] = self.get_date(self.filters['date'])
        else:
            new_filters['Period'] = f"For the period ending {self.generated_date}"

        if self.filters:
            for key, value in self.filters.items():
                if key == 'search' and value:
                    new_filters['Search Term'] = value
                elif key in ('purchases', 'sales', 'journals') and value:
                    new_filters['Type'] = self.get_type(value)
                elif key == 'sort_by' and value:
                    new_filters['Sort By'] = self.get_sort(value)
                elif key == 'status':
                    new_filters['Status'] = self.get_status(value)
                elif key == 'due_days':
                    new_filters['Due Days'] = self.get_due_days(value)
               
        return new_filters

    def get_status(self, value):
        return value.title().replace('_', ' ')
    
    def get_due_days(self, value):
        new_value = ''
        if value == "in_two":
            new_value = "In two days"

        elif value == "three_to_seven":
            new_value = "3 to 7 days"
        
        elif value == "eight_to_thirty":
            new_value = "8 to 30 days"

    
        elif value == "than_thirty":
            new_value = "More than 30 days",
    
        elif value  == "overdue":
            new_value =  "Overdue"

        else:
            new_value = 'All'

        return new_value
    
    def get_date(self, value):
        new_value = ''
        today = self.generated_date

        if value == 'today':
            new_value =f'For {today}'
        elif value == 'yesterday':
            yesterday = today - timedelta(days=1)
            new_value = f'For {yesterday}'
        elif value == 'this_week':
            start_week = today - timedelta(days=today.weekday())
            new_value = f"From {start_week} to {today}"
        elif value == 'this_month':
            start_month = today.replace(day=1)
            new_value = f"From {start_month} to {today}"
        elif "to" in value and value != 'today':
            new_value = f"From {value.replace('to', ' to ')}"
        elif value == 'all':
            new_value = f"For the period ending {self.generated_date}"
        else:
            new_value = value.title().replace('_', ' ')
        return new_value      

    def get_sort(self, value):
        new_value = ''
        if value == 'newest':
            new_value = 'Newest Added'
        elif value == 'oldest':
            new_value = 'Earliest Added'
        else:
            new_value = 'Unsorted'
        return new_value

    def get_type(self, value):
        new_value = ''
        if value == 'is_invoices':
            new_value = 'Invoices'
        elif value == 'is_bills':
            new_value = 'Bills'

        elif value == 'is_bills_or_invoices':
            new_value = 'Bills and Invoices'
        elif value == "all":
            new_value = "All"

        else:
            new_value = "Regular"

        return new_value
            
