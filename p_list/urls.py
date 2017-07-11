from django.conf.urls import url, include

from . import views

app_name = "p_list"
urlpatterns = [
    url(r'^$', views.index),
    url(r'^(?P<year>\d{4})/(?P<month>\d{1,2})/$', views.index, name="index-month"),
    url(r'^(?P<year>\d{4})/$', views.index, name="index-year"),
	url(r'^index/$', views.index, name="index"),
    url(r'^all/$', views.all_index, name="all_index"),
    url(r'^download_rcv/(?P<rcv_filename>.+)$', views.download_rcv, name="download_rcv"),
    url(r'^view_rcv/(?P<rcv_filename>.+)$', views.view_rcv, name="view_rcv"),
    url(r'^upload_file/$', views.upload_file, name="upload"),
    url(r'^check_files_to_model/$',  views.check_files_to_model, name='check_files_to_model'),
    url(r'delete/$', views.delete, name='delete'),
    url(r'^test/$', views.test),
]