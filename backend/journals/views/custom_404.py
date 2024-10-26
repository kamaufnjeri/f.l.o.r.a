from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny


class Custom404APIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response(
            data={
                "error": "Error 404",
                "details": "The requested URL was not found on this server."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    def post(self, request, *args, **kwargs):
        return Response(
            data={
                "error": "Error 404",
                "details": "The requested URL was not found on this server."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    def put(self, request, *args, **kwargs):
        return Response(
            data={
                "error": "Error 404",
                "details": "The requested URL was not found on this server."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    def delete(self, request, *args, **kwargs):
        return Response(
            data={
                "error": "Error 404",
                "details": "The requested URL was not found on this server."
            },
            status=status.HTTP_404_NOT_FOUND
        )
