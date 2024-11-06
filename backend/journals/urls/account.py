from django.urls import path
from journals.views import AccountAPIView, AccountDetailAPIView, SubCategoryAPIView, CategoryAPIView
from django.urls import path


urlpatterns = [
    path('', AccountAPIView.as_view(), name="Accounts"),
    path('categories/', CategoryAPIView.as_view()),
    path('sub_categories/', SubCategoryAPIView.as_view()),
    path('<pk>/', AccountDetailAPIView.as_view(), name="Accounts")
]