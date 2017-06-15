from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

from django.contrib.auth.decorators import login_required
from django.views.static import serve

from django.urls import reverse
from .models import RCV

import os

from .forms import UploadRCV

from .models import RCV

def test(request):
    return HttpResponse("HELLO")

def index(request):
    path="./media/rcv/"
    rcv_list = os.listdir(path)
    path_name = os.path.abspath(path)

    return render(
        request,
        'p_list/index.html',
        context = {"rcv_list": rcv_list, "path_name": path_name}
    )

def download_rcv(request, rcv_name):
    filepath = './media/rcv/' + rcv_name

    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

@login_required
def upload_file(request):
    if request.method == 'POST':
        rcvform = UploadRCV(request.POST, request.FILES)
        if rcvform.is_valid():
            # form hands request.FILES
            rcv = RCV(rcvfile=request.FILES["rcvfile"], filename=request.FILES['rcvfile'].name)
            rcv.save()
            # rcvform.save()

            return HttpResponseRedirect(reverse('p_list:upload'))
    else:
        rcvform = UploadRCV()

    rcvs = RCV.objects.all()

    return render(
        request,
        'p_list/upload.html',
        context={'rcvs': rcvs, 'rcvform': rcvform,})

def check_files_to_model(request):
    path="./media/rcv/"
    rcv_list = os.listdir(path)
    path_name = os.path.abspath(path)


    rcv_string = ''
    rcv_list = RCV.objects.all()
    for rcv in rcv_list:
        rcv_string += rcv.filename
    return HttpResponse(rcv_string)
