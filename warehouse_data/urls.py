from django.conf.urls import url, include

from . import views

app_name = "warehouse_data"

urlpatterns = [
    url(r'^get_dates_ajax/$', views.get_dates, name="get_dates"),
]