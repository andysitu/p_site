from django.urls import include, path
from django.conf.urls import url

from . import views

app_name = "inventory_tracker"
urlpatterns = [
    url(r'^$', views.index, name="index-blank"),
    url(r'^create/$', views.create_inv, name="create-inv"),
    url(r'^view_payment/$', views.create_inv, name="view-payment"),

    url(r'^view_vendor/$', views.view_vendor, name="view-vendor"),
    url(r'^view_itemtype/$', views.view_itemtype, name="view-itemtype"),
    url(r'^view_dept/$', views.view_dept, name="view-dept"),
]