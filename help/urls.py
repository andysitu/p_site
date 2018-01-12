from django.urls import include, path, re_path
from . import views

app_name = "help"
urlpatterns = [
    re_path('^$', views.help, name="help"),
    re_path("help/warehouse_viewer/$", views.help_warehouse_viewer, name="warehouse_viewer_help"),
]