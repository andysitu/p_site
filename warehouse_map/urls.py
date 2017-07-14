from django.conf.urls import url, include

from . import views

app_name = "warehouse_map"
urlpatterns = [
    url(r'^test/$', views.test),
    url(r'^$', views.test, name="index-blank"),
    url(r'^index/$', views.test, name="index"),
]