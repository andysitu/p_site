from django.conf.urls import url, include

from . import views

app_name = "warehouse_viewer"
urlpatterns = [
    url(r'^warehouse_viewer/$', views.viewer, name="viewer"),
    url(r'^index/$', views.viewer, name="index"),
    url(r'^$', views.viewer, name="index-blank"),
    url(r'^upload/$', views.upload, name="upload"),
    url(r'^adv_search/$', views.adv_search, name="adv_search"),

    url(r'^search_ajax/$', views.search_ajax, name="search_ajax"),
    url(r'^adv_search_ajax/$', views.adv_search_ajax, name="adv_search_ajax"),
    # url(r'^request_grid_map_ajax/$', ajax_func.get_grid_ajax, name="request_grid_map_ajax"),
    # url(r'^request_date_ajax/$', ajax_func.get_proc_dates, name="request_date_ajax"),
    # url(r'^request_map_search_info_ajax/$', ajax_func.get_map_search_info, name="request_map_search_info"),
    # url(r'^date_del_ajax/$', ajax_func.delete_by_date, name="date_by_date"),
]