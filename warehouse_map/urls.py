from django.conf.urls import url, include

from . import views

app_name = "warehouse_map"
urlpatterns = [
url(r'^test/$', views.test),
]