from django.urls import path
from . import views
from .views import vworld_geocode

urlpatterns = [
    path('', views.index, name='index'),
    path("api/geocode/", vworld_geocode, name="geocode"),
]