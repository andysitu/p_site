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
    url(r'^view_items/$', views.view_items, name="view_items"),

    # Ajax urls
    url(r'^get_payment_ajax/$', views.get_payment_ajax, name="get-payment-ajax"),
    url(r'^submit_payment_ajax/$', views.submit_payment_ajax, name="submit-payment-ajax"),

    url(r'^get_department_ajax/$', views.get_department_ajax, name="get_department_ajax"),
    url(r'^submit_department_ajax/$', views.submit_department_ajax, name="submit_department_ajax"),

    url(r'^create_purchase_ajax/$', views.create_purchase_ajax, name="create_purchase_ajax"),
    url(r'^search_inv_ajax/$', views.search_inv_ajax, name="search_inv_ajax"),

    url(r'^download_invoice_ajax/$', views.download_invoice_ajax, name="download_invoice_ajax"),

    url(r'^search_items_ajax/$', views.search_items_ajax, name="search_items_ajax"),
]