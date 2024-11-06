from rest_framework.views import APIView
from django.http import HttpResponse
from journals.utils.generate_pdfs import GeneratePurchasePDF, GenerateSalePDF, GenerateJournalPDF, GenerateServiceIncomePDF
from rest_framework import status
from rest_framework.response import Response

class GeneratePDFAPIView(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        
        title = data.get('title', '').replace(' ', "_")
        
        filename = f"{title}_report.pdf"

        
        try:
            pdf_generator = None
            if 'Purchase' in title:
                pdf_generator = GeneratePurchasePDF(title, request.user.current_org, data.get('data'))
            elif 'Sale' in title:
                pdf_generator = GenerateSalePDF(title, request.user.current_org, data.get('data'))
            elif 'Journal' in title:
                pdf_generator = GenerateJournalPDF(title, request.user.current_org, data.get('data'))

            elif 'Service' in title:
                pdf_generator = GenerateServiceIncomePDF(title, request.user.current_org, data.get('data'))

            else:
                raise ValueError("Invalid title")
            

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
