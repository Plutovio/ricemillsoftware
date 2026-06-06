from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BankGuaranteeViewSet, DropdownOptionViewSet

router = DefaultRouter()
router.register(r'bank-guarantee', BankGuaranteeViewSet, basename='bank-guarantee')
router.register(r'dropdowns', DropdownOptionViewSet, basename='dropdowns')

urlpatterns = [
    path('', include(router.urls)),
]
