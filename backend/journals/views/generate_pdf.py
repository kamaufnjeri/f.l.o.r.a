from rest_framework.views import APIView
from django.http import HttpResponse
from journals.utils.generate_pdfs import  GenerateSinglePDF
from rest_framework import status
from rest_framework.response import Response

class GeneratePDFAPIView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        
        title = data.get('title', '').replace(' ', "_")
        
        filename = f"{title}.pdf"

        
        try:
            if 'Purchase' in title:
                filename = 'single_purchase.html'
            elif 'Sale' in title:
                filename= 'single_sales.html'
            elif 'Journal' in title:
                filename = 'single_journal.html'

            elif 'Service' in title:
                filename = 'single_service_income.html'

            else:
                raise ValueError("Invalid title")
            
            pdf_generator = GenerateSinglePDF(title, request.user, data.get('data'), filename=filename)
            if pdf_generator is None:
                return Response({"error": "Invalid report type."}, status=status.HTTP_400_BAD_REQUEST)
            
            buffer = pdf_generator.create_pdf()
            
            if not buffer:
                return Response({"error": "Failed to generate PDF."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
        
    
        except Exception as e:
            print(str(e))
            raise e
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
