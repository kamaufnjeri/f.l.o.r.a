from rest_framework import views, status
from journals.utils import get_serial_number
from journals.models import Journal, Purchase, Sales, Bill, Invoice
from rest_framework.response import Response



class GetSerialNumberApiView(views.APIView):
    def get(self, request, *args, **kwargs):
        try:
            initial_name = request.query_params.get('initial_name')

            if initial_name:
                items = []
                if initial_name == 'JOURN':
                    items = Journal.objects.all()
                elif initial_name == 'PURCH':
                    items = Purchase.objects.all()
                elif initial_name == 'SALE':
                    items = Sales.objects.all()
                elif initial_name == 'BILL':
                    items = Bill.objects.all()
                elif initial_name == 'INV':
                    items = Invoice.objects.all()
                else:
                    raise ValueError("Initial name can only be 'BILL', 'INV', 'SALE', 'PURCH' or 'JOURN'")
                serial_number = get_serial_number(items, initial_name, len(items))
                return Response({"serial_number": serial_number}, status=status.HTTP_200_OK)
            else:
                raise ValueError('Initial name must be given')
        except ValueError as val_err:
            return Response({"error": "Bad request", "details": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
