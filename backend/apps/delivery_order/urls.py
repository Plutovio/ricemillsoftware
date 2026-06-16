from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryOrderViewSet, KaantaParchiViewSet

router = DefaultRouter()
router.register(r'delivery-orders', DeliveryOrderViewSet, basename='delivery-orders')
router.register(r'kaanta-parchi', KaantaParchiViewSet, basename='kaanta-parchi')

urlpatterns = [
    path('', include(router.urls)),
]
