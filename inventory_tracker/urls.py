from django.urls import include, path
from django.conf.urls import url

from . import views

app_name = "inventory_tracker"
urlpatterns = [
    url(r'^$', views.index, name="index-blank"),
    url(r'^create/$', views.create_inv, name="create-inv"),
    url(r'^view_payment/$', views.view_payment, name="view-payment"),

    url(r'^view_vendor/$', views.view_vendor, name="view-vendor"),
    url(r'^view_dept/$', views.view_dept, name="view-dept"),

    # Ajax urls
    url(r'^get_payment_ajax/$', views.get_payment_ajax, name="get-payment-ajax"),
    url(r'^submit_payment_ajax/$', views.submit_payment_ajax, name="submit-payment-ajax"),

    url(r'^get_vendor_ajax/$', views.get_vendor_ajax, name="get_vendor_ajax"),
    url(r'^submit_vendor_ajax/$', views.submit_vendor_ajax, name="submit_vendor_ajax"),

    url(r'^get_department_ajax/$', views.get_department_ajax, name="get_department_ajax"),
    url(r'^submit_department_ajax/$', views.submit_department_ajax, name="submit_department_ajax"),

    url(r'^create_item_ajax/$', views.create_item_ajax, name="create_item_ajax"),
]