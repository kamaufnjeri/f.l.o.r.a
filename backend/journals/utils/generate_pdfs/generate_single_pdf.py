from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from datetime import datetime
import io
import os

class GenerateSinglePDF:
    def __init__(self, title, user, data, filename):
        self.title = self.capitalize(title)
        self.data = data
        self.organisation = user.current_org
        self.user = user
        self.author = 'F.L.O.R.A'
        self.author_full = "Financial Ledgers and Operations Report Analysis"
        self.template_path = os.path.join(os.path.dirname(__file__), '../templates')
        self.css_path = f"{self.template_path}/static/styles.css"
        self.template_filename = filename 
        self.logo_path = './images/logo.png'
        self.generated_date = datetime.today().strftime('%Y-%m-%d')
        self.generated_time = datetime.today().strftime("%I:%M %p")

    def create_pdf(self):
        """Generate the PDF using the HTML template and xhtml2pdf."""
        env = Environment(loader=FileSystemLoader(self.template_path))
        template = env.get_template(self.template_filename)

        title = self.title

        context = {
            'report_title': title,
            'organisation': self.organisation,
            'user': self.user,
            'author_full': self.author_full,
            'logo_path': self.logo_path,
            'sub_header_data': self.get_sub_header_data(),
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
    
    def get_sub_header_data(self):
        data = {}
        title = self.title
        key = ''
        if 'Purchase' in title:
            key = 'Purchase #'
        elif 'Sales' in title:
            key = 'Sales #'
        elif 'Journal' in title:
            key = 'Journal #'
        elif 'Service Income':
            key = 'Service Income #'

        data[key] = self.data.get('serial_number')
        data['Date'] = self.data.get('date')

        invoice_bill = self.data.get('invoice') or self.data.get('bill') or None
        
        if invoice_bill:
            key = ''
            if invoice_bill.get('customer_name'):
                data['Customer'] = invoice_bill.get('customer_name')
                key = ''
                
            else:
                data['Supplier'] =  invoice_bill.get('supplier_name')
                key = ''

            data['Due Date'] = invoice_bill.get('due_date')
            data['Status'] = self.capitalize(invoice_bill.get('status'))
            data[key] = ''


        return data
    
    
    def capitalize(self, name):
        return name.title().replace('_', ' ')
    
   