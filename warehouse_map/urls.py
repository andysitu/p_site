from django.conf.urls import url, include

from . import views

app_name = "warehouse_map"
urlpatterns = [
    url(r'^$', views.view_map, name="index-blank"),
    url(r'^index/$', views.view_map, name="index"),
    url(r'upload_excel/$', views.upload_excel_data, name="upload_excel_data"),
    url(r'^reset_db/$', views.reset_db, name="reset_db"),
    url(r'^reset_db_true/$', views.reset_db_true, name="reset_db_true"),
    url(r'^get_info/$', views.get_info, name="get_info"),
    url(r'^request_grid_map_ajax/$', views.get_grid_ajax, name="request_grid_map_ajax"),
]