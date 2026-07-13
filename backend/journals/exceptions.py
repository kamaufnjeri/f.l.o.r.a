# exceptions.py
from rest_framework.views import exception_handler
from journals.utils import flatten_errors
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    # Let Django handle exceptions it doesn't know about
    if response is None:
        return response

    if hasattr(exc, "detail"):
        details = flatten_errors(exc.detail)
    else:
        details = [str(exc)]

    if response.status_code == status.HTTP_400_BAD_REQUEST:
        error = "Bad Request"
    elif response.status_code == status.HTTP_401_UNAUTHORIZED:
        error = "Unauthorized"
    elif response.status_code == status.HTTP_403_FORBIDDEN:
        error = "Forbidden"
    elif response.status_code == status.HTTP_404_NOT_FOUND:
        error = "Not Found"
    else:
        error = "Error"

    response.data = {
        "error": error,
        "details": details,
    }

    return response