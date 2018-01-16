from django.urls import include, path, re_path
from . import views

app_name = "help"
urlpatterns = [
    re_path('^$', views.help, name="home"),
    path('warehouse_viewer', views.warehouse_viewer, name="warehouse_viewer"),
    re_path("^warehouse_viewer_upload/$", views.warehouse_viewer_upload, name="warehouse_viewer_upload"),
]