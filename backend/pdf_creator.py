from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet

LOGOPATH = './images/logo.png'  # Update this path to your logo

class PDF:
    def __init__(self, filename, title, organisation):
        self.filename = filename
        self.title = title
        self.organisation = organisation
        self.author = 'F.L.O.R.A'
        self.author_full = "Financial Ledgers and Operations Report Analysis"
        self.logo_path = LOGOPATH
        self.doc = SimpleDocTemplate(self.filename, pagesize=letter)
        self.story = []
        self.styles = getSampleStyleSheet()
        self.width, self.height = letter

    def create_pdf(self):
        """Create the PDF with header and content."""
        
        data = [
             ['Item', 'Quantity', 'Unit Price', 'Total'],
            ['Item 1', 10, 100, 1000],
            ['Item 2', 5, 50, 250],
            ['Item 3', 2, 20, 40],
        ]
        purch_data = [
            ["Purchase #", "PURCH-1", "Date", "2014-10-28"],
            ["Type", "Bill", "Currency", self.organisation.get("currency")]
        ]
        bottom_info = [
            ['', '', 'Discount 10%', 129],
            ['', '', 'Cash Paid', 1061],
            ['', '', 'Total', f"{self.organisation.get('currency')} 1290"]
        ]
        self.add_info(purch_data)
        self.add_bill_info()
        self.create_table(data)
        self.add_payment_data(bottom_info)

        # Build the PDF
        self.doc.build(self.story, onFirstPage=self.add_header_footer, onLaterPages=self.add_header_footer)

    def add_bill_info(self):
        bill_data = [
            ["Bill #", "BILL-3", "Supplier", "John Doe"],
            ["Due Date", "2024-10-31", "Amount Due", "120.00"],
            ["Amount Paid", "0.00", "Status", "Unpaid"],
        ]
        self.add_info(bill_data)

    def add_info(self, data):
        data = data
        table_width = self.width - 90  # Adjust for margins
        key_col_width = table_width * 0.25  # 25% for each key
        value_col_width = table_width * 0.25  # 25% for each value
        
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
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),  # Align second column to right
            ('ALIGN', (3, 0), (3, -1), 'RIGHT'),  # Align last column to right
        ])
        table.setStyle(style)
        self.story.append(table)

    def add_payment_data(self, data):
        table_width = self.width - 100  # Full width minus margins
        
        table = Table(data, colWidths=[table_width / len(data[0])] * len(data[0]))

        style = TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),  # Align the second column to right
            ('ALIGN', (3, 0), (3, -1), 'RIGHT'),  # Align the last column to right
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('BACKGROUND', (0, 0), (-1, -1), colors.beige),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BACKGROUND', (2, -1), (-1, -1), colors.darkmagenta),
            ('TEXTCOLOR', (2, -1), (-1, -1), colors.whitesmoke),


        ])
        table.setStyle(style)

        self.story.append(table)
        self.story.append(Spacer(1, 20))

    def add_header_footer(self, canvas, doc):
        canvas.setAuthor(self.author)
        canvas.setTitle(self.title)
        canvas.setStrokeColor(colors.black)
        canvas.setLineWidth(1)
        canvas.line(50, 50, self.width - 50, 50)  # Horizontal line across the footer

        # Page number
        canvas.setFont("Helvetica", 12)
        page_number = doc.page
        page_text = f"Page {page_number}"
        canvas.drawString(50, 35, page_text)

        # Name 'F.L.O.R.A' in the footer
        footer_text = f"\u00A9 {self.author}"
        text_width = canvas.stringWidth(footer_text, "Helvetica", 12)
        canvas.drawString(self.width - text_width - 50 , 35, footer_text) 

        logo_width = 100
        logo = ImageReader(self.logo_path)
        logo_height = logo.getSize()[1] * logo_width / logo.getSize()[0]
        logo_y = self.height - logo_height
        logo_x = 50

        # Draw the logo
        canvas.setFillColor(colors.black)
        canvas.drawImage(logo, self.width - logo_x - logo_width, logo_y - 10, width=logo_width, height=logo_height, mask='auto')

        canvas.setFont("Helvetica", 10)
        canvas.setFillColor(colors.black)

        text_width = canvas.stringWidth(self.author_full, "Helvetica", 10)
        canvas.drawString(self.width - text_width - logo_width/ 4 - logo_x , logo_y - 10, self.author_full) 

        org_name = self.organisation.get("org_name", "")
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
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),  # Align 'Price' column to the right
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ])
        table.setStyle(style)

        self.story.append(Spacer(1, 10))
        self.story.append(table)

# Usage
organisation = {
    "org_name": "NextNille",
    "currency": "Kshs"
}

pdf = PDF("output.pdf", 'Purchase Report', organisation)
pdf.create_pdf()
