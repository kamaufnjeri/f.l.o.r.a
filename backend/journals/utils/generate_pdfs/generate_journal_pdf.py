from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
import io

LOGOPATH = './images/logo.png' 

class GenerateJournalPDF:
    def __init__(self, title, organisation, data):
        self.title = f'{self.capitalize(title)} Report'
        self.data = data
        self.organisation = organisation
        self.author = 'F.L.O.R.A'
        self.author_full = "Financial Ledgers and Operations Report Analysis"
        self.logo_path = LOGOPATH
        self.buffer = io.BytesIO()
        self.doc = SimpleDocTemplate(self.buffer, pagesize=letter)
        self.story = []
        self.styles = getSampleStyleSheet()
        self.width, self.height = letter

    def create_pdf(self):
        """Create the PDF with header and content."""
        
        if 'Journal' in self.title:
            self.create_journal()
       
        self.doc.build(self.story, onFirstPage=self.add_header_footer, onLaterPages=self.add_header_footer)
        
        self.buffer.seek(0)
        return self.buffer
    
    def create_journal(self):
        self.add_journal_sub_header()
        self.add_journal_items()
        self.add_journal_sub_footer()

    def add_journal_sub_footer(self):
        journal_data = [

        ]
        
        invoice_bill = self.data.get('invoice') or self.data.get('bill') or None

        if invoice_bill:
            invoice_bill_data = [
                ['Amount Paid', invoice_bill.get('amount_paid')],
                ['Amount Due', f"{self.organisation.currency} {invoice_bill.get('amount_due')}"],
            ]

            journal_data.extend(invoice_bill_data)

       
            self.add_payment_data(journal_data)


    def add_journal_items(self):
        journal_entries = self.data.get("journal_entries", [])
        journal_entries_data = [["Account", "Debit", "Credit"]]
        
        for entry in journal_entries:
            entry_type = entry.get("debit_credit")
            amount = entry.get("amount")
            debit_value = amount if entry_type == 'debit' else "_"
            credit_value = amount if entry_type == 'credit' else "_"
            journal_entries_data.append([entry.get("account_name"), debit_value, credit_value])

        journal_entries_totals = self.data.get("journal_entries_total", {"debit_total": "0.00", "credit_total": "0.00"})
        debit_total = f"{self.organisation.currency} {journal_entries_totals.get('debit_total')}"
        credit_total =f"{self.organisation.currency} {journal_entries_totals.get('credit_total')}"
        journal_entries_data.append(["Total", debit_total, credit_total])
        
        self.create_table(journal_entries_data)
    
    
    def capitalize(self, name):
        return name.title().replace('_', ' ')

    def add_journal_sub_header(self):
        journal_data = [
            ['Journal #', self.data.get("serial_number"), 'Date', self.data.get("date")],
            ['Type', self.title, 'Currency', self.organisation.currency]
        ]
        invoice_bill = self.data.get('invoice') or self.data.get('bill') or None
        if invoice_bill:
            supplier_customer_key = ''
            supplier_customer_value = ''
            if invoice_bill.get('customer_name'):
                supplier_customer_key = 'Customer'
                supplier_customer_value =  invoice_bill.get('customer_name')
            else:
                supplier_customer_key = 'Supplier'
                supplier_customer_value =  invoice_bill.get('supplier_name')

            invoice_bill_data = [
                [ 'Invoice #', invoice_bill.get('serial_number'), supplier_customer_key, supplier_customer_value],
                ['Due Date', invoice_bill.get("due_date"),'Status', self.capitalize(invoice_bill.get("status"))]
            ]

            journal_data.extend(invoice_bill_data)
        


       
        self.add_info(journal_data)

    def add_info(self, data):
        table_width = self.width - 90  
        key_col_width = table_width * 0.25  
        value_col_width = table_width * 0.25  
        
        table = Table(data, colWidths=[key_col_width, value_col_width, key_col_width, value_col_width])
        
        style = TableStyle([
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (0, 0), (0, -1), 11),
            ('FONTSIZE', (2, 0), (2, -1), 11),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),  
            ('ALIGN', (3, 0), (3, -1), 'RIGHT'),  
        ])
        table.setStyle(style)
        self.story.append(table)

    def add_payment_data(self, data):
        table_width = self.width - 100
        key_cols_width = table_width * 0.75
        value_cols_width = table_width * 0.25
        
        table = Table(data, colWidths=[key_cols_width, value_cols_width])

        base_style = TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),          
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, -1), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('BACKGROUND', (0, 0), (-1, -1), colors.beige),
            ('FONTSIZE', (0, 0), (-1, -1), 10)
        ])
        for row_index, row in enumerate(data):
            if  row[0] == 'Amount Due':  # Highlight the Total row
                base_style.add('BACKGROUND', (0, row_index), (-1, row_index), colors.darkred)
                base_style.add('TEXTCOLOR', (0, row_index), (-1, row_index), colors.whitesmoke)

        table.setStyle(base_style)

        self.story.append(table)
        self.story.append(Spacer(1, 20))

    def add_header_footer(self, canvas, doc):
        canvas.setAuthor(self.author)
        canvas.setTitle(self.title)
        canvas.setStrokeColor(colors.black)
        canvas.setLineWidth(1)
        canvas.line(50, 50, self.width - 50, 50)  

        canvas.setFont("Helvetica", 12)
        page_number = doc.page
        page_text = f"Page {page_number}"
        canvas.drawString(50, 35, page_text)

        footer_text = f"\u00A9 {self.author}"
        text_width = canvas.stringWidth(footer_text, "Helvetica", 12)
        canvas.drawString(self.width - text_width - 50 , 35, footer_text) 

        logo_width = 100
        logo = ImageReader(self.logo_path)
        logo_height = logo.getSize()[1] * logo_width / logo.getSize()[0]
        logo_y = self.height - logo_height
        logo_x = 50

        canvas.setFillColor(colors.black)
        canvas.drawImage(logo, self.width - logo_x - logo_width, logo_y - 10, width=logo_width, height=logo_height, mask='auto')

        canvas.setFont("Helvetica", 10)
        canvas.setFillColor(colors.black)

        text_width = canvas.stringWidth(self.author_full, "Helvetica", 10)
        canvas.drawString(self.width - text_width - logo_width / 4 - logo_x, logo_y - 10, self.author_full) 

        org_name = self.organisation.org_name
        canvas.setFillColor(colors.darkmagenta)

        canvas.setFont("Helvetica-Bold", 24)
        canvas.drawString(logo_x, self.height - 40, org_name)

        canvas.setFont("Helvetica", 16)
        canvas.drawString(logo_x, self.height - 60, self.title)

    def create_table(self, data):
        """Create a table for the PDF."""
        table_width = self.width - 100
        
        table = Table(data, colWidths=[table_width / len(data[0])] * len(data[0]))

        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkmagenta),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
             ('BACKGROUND', (0, -1), (-1, -1), colors.darkmagenta),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('BACKGROUND', (0, 1), (-2, -2), colors.beige),
        ])
        table.setStyle(style)

        self.story.append(Spacer(1, 10))
        self.story.append(table)
