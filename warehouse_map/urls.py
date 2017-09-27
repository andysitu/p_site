from django.conf.urls import url, include

from . import views, ajax_func

app_name = "warehouse_map"
urlpatterns = [
    url(r'^$', views.view_map, name="index-blank"),
    url(r'^index/$', views.view_map, name="index"),
    url(r'upload_excel/$', views.upload_excel_data, name="upload_excel_data"),
    url(r'^reset_db/$', views.reset_db, name="reset_db"),
    url(r'^reset_db_true/$', views.reset_db_true, name="reset_db_true"),
    url(r'^reset_grid/$', views.reset_grid_map, name="reset_grid_map"),
    url(r'^get_info/$', views.get_info, name="get_info"),

    url(r'^request_grid_map_ajax/$', ajax_func.get_grid_ajax, name="request_grid_map_ajax"),
    url(r'^request_date_ajax/$', ajax_func.get_proc_dates, name="request_date_ajax"),
    url(r'^request_map_search_info_ajax/$', ajax_func.get_map_search_info, name="request_map_search_info"),
    url(r'^date_del_ajax/$', ajax_func.delete_by_date, name="date_by_date"),
]