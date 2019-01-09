from django.urls import include, path
from django.conf.urls import url

from . import views

app_name = "shipment_track"
urlpatterns = [
    url(r'^index/$', views.home, name="index"),
    url(r'^$', views.home, name="index-blank"),

    url(r'^submit_tracking_ajax', views.submit_tracking_ajax, name="submit_tracking_ajax"),
    url(r'^get_tracking_data_ajax', views.get_tracking_data_ajax, name="get_tracking_data_ajax"),
    url(r'^get_types_ajax', views.get_types_ajax, name="get_types_ajax"),
    url(r'^ajax_command', views.ajax_command, name="ajax_command"),
]