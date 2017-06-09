from django.conf.urls import url

from . import views

app_name = "p_list"
urlpatterns = [
	url(r'^$', views.index, name="index"),
    url(r'^download_rcv/(?P<rcv_name>.+$)', views.download_rcv, name="download_rcv"),
]