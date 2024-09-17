from django.urls import path
from journals.views import Custom404APIView
from django.urls import path


urlpatterns = [
   path('<path:resource>', Custom404APIView.as_view())
]