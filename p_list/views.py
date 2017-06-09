from django.shortcuts import render
from django.http import HttpResponse

from django.contrib.auth.decorators import login_required
from django.views.static import serve

import os


def index(request):
    path=".\\rcv_pdf"
    rcv_list = os.listdir(path)
    path_name = os.path.abspath(path)

    return render(
        request,
        'p_list/index.html',
        context = {"rcv_list": rcv_list, "path_name": path_name}
    )

def download_rcv(request, rcv_name):
    filepath = 'C:\\Users\\A\\Documents\\GitHub\\p_site\\rcv_pdf' + '\\' + rcv_name

    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))