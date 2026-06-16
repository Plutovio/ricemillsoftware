from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/', include('apps.bank_guarantee.urls')),
    path('api/', include('apps.delivery_order.urls')),
]
