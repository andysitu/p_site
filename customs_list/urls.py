from django.conf.urls import url, include

from . import views

app_name = "customs_list"
urlpatterns = [
    url(r'^test/$', views.test),
    url(r'^upload/$', views.upload, name="upload"),
    url(r'^view_all/$', views.list_all, name="view_all"),
    url(r'^index$', views.list_all, name="index"),
    url(r'^$', views.list_all, name="index-blank"),
    url(r'^download/(?P<file_name>[\w\d\s\.]+)', views.download_customs_pdf, name="download"),
]
