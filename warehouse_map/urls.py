from django.conf.urls import url, include

from . import views

app_name = "warehouse_map"
urlpatterns = [
    url(r'^test/$', views.test),
    url(r'^$', views.view_map, name="index-blank"),
    url(r'^index/$', views.view_map, name="index"),
    url(r'upload_excel/$', views.upload_excel_data, name="upload_excel_data"),
    url(r'^reset_db/$', views.reset_db, name="reset_db"),
]