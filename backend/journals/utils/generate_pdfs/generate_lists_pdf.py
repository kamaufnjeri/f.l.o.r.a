from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
import io
import os

class GenerateListsPDF:
    def __init__(self, title, organisation, data, filters, filename):
        self.title = title
        self.data = data
        self.filters = filters
        self.organisation = organisation
        self.author = 'F.L.O.R.A'
        self.author_full = "Financial Ledgers and Operations Report Analysis"
        self.template_path = os.path.join(os.path.dirname(__file__), '../templates')
        self.css_path = f"{self.template_path}/static/styles.css"
        self.template_filename = filename  # Name of your template file
        self.logo_path = './images/logo.png'

    def create_pdf(self):
        """Generate the PDF using the HTML template and xhtml2pdf."""
        # Load the HTML template using Jinja2
        env = Environment(loader=FileSystemLoader(self.template_path))
        template = env.get_template(self.template_filename)

        title = self.title
        if self.get_search_filters():
            title = f'Filtered {self.title}'

        # Prepare the data context for the template
        context = {
            'report_title': title,
            'organisation': self.organisation,
            'currency': self.organisation,
            'author_full': self.author_full,
            'logo_path': self.logo_path,
            'search_filters': self.get_search_filters(),
            'data': self.data,
            "css_path": self.css_path
        }

        # Render the HTML content with the data
        html_content = template.render(context)

        # Generate PDF from the rendered HTML content
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
        from datetime import datetime

        new_filters = OrderedDict()

        if 'date' in self.filters and self.filters['date']:
            new_filters['Period'] = self.get_date(self.filters['date'])
        else:
            new_filters['Period'] = f"For the period ending {datetime.today().strftime('%Y-%m-%d')}"

        for key, value in self.filters.items():
            if key == 'search' and value:
                new_filters['Search Term'] = value
            if key in ('purchases', 'sales', 'journals') and value:
                new_filters['Type'] = self.get_type(value)
            if key == 'sort_by' and value:
                new_filters['Sort By'] = self.get_sort(value)

        return new_filters
    
    def get_date(self, value):
        new_value = ''
        if "to" in value and value != 'today':
            new_value = f"From {value.replace('to', ' to ')}"
        elif value == 'all':
            from datetime import datetime
            new_value = f"For the period ending {datetime.today().strftime('%Y-%m-%d')}"
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
            
