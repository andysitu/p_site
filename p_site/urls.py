"""p_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin

from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static

from . import views
from django.contrib.auth import views as auth_views
from django.views.i18n import JavaScriptCatalog


urlpatterns = [
    url(r'^jsi18n/$', JavaScriptCatalog.as_view(), name='javascript-catalog'),
    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^admin/', admin.site.urls),
    url(r'^customs_list/', include('customs_list.urls')),
    url(r'^warehouse_data/', include('warehouse_data.urls')),
    url(r'^warehouse_viewer/', include('warehouse_viewer.urls')),
    url(r'^rcv_list/', include('rcv_list.urls')),
    url(r'^warehouse_map/', include('warehouse_map.urls')),
    url(r'^uploader/', include('uploader.urls')),
    url(r'^$', views.index),
    url(r'^index/$', views.index, name="index"),
    url(r'^accounts/login/', auth_views.LoginView.as_view(template_name='p_site/registration/login.html'), name="login"),
    url(r'^accounts/logout/', auth_views.LogoutView.as_view(template_name='p_site/registration/logout.html'), name="logout"),

    re_path('help/', views.help),
]

urlpatterns += [
    url(r'^accounts/', include('django.contrib.auth.urls')),
]


urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)