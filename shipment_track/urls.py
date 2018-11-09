from django.urls import include, path
from django.conf.urls import url

from . import views

app_name = "shipment_track"
urlpatterns = [
    url(r'^index/$', views.home, name="index"),
    url(r'^$', views.home, name="index-blank"),
]