from django.conf.urls import url, include

from . import views

app_name = "customs_list"
urlpatterns = [
    url(r'^test/$', views.test),
    url(r'^upload/$', views.upload, name="upload"),
    url(r'^view_all/$', views.list_all, name="view_all_customs"),
    url(r'^index$', views.list_all, name="index"),
    url(r'^$', views.list_all, name="index-blank"),
    url(r'^download/(?P<file_name>[\w\d\s\.]+)$', views.download_customs_pdf, name="download"),
    url(r'^view/(?P<file_name>[\w\d\s\.]+)$', views.view_customs_pdf, name="view"),
    url(r'^delete/$', views.delete, name='delete'),
    url(r'edit/(?P<filename>[\w\d\s\.]+)$', views.edit_cust_dec, name="edit"),
    url(r'^view_by_date/$', views.list_date, name="view_by_date"),
    url(r'^view_by_date/(?P<year>\d{4})/$', views.list_date, name="view_by_date"),
    url(r'^view_by_date/(?P<year>\d{4})/(?P<month>\d{2})/$', views.list_date, name="view_by_date"),
    url(r'^view_by_date/(?P<year>\d{4})/(?P<month>\d{2})/(?P<day>\d{2})/$', views.list_date, name="view_by_date"),
]