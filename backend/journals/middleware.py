import threading

_thread_locals = threading.local()

def set_current_user(user):
    _thread_locals.user = user

def get_current_user():
    return getattr(_thread_locals, 'user', None)

class RefreshCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        new_access = getattr(request, "_new_access_token", None)

        if new_access:
            response.set_cookie(
                "accessToken",
                new_access,
                httponly=True,
                secure=True,   # production
                samesite="None",
                max_age=60 * 60 * 24,
            )

        return response