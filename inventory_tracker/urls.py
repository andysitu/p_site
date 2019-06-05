from django.urls import include, path
from django.conf.urls import url

from . import views

app_name = "inventory_tracker"
urlpatterns = [
    url(r'^$', views.index, name="index-blank"),
    url(r'^create/$', views.create_inv, name="create-inv"),
]