from django.conf.urls import url, include

from . import views

app_name = "customs_list"
urlpatterns = [
    url(r'^test/$', views.test),
    url(r'^upload/$', views.upload, name="upload"),
]
