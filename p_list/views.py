from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.core.files import File

from django.contrib.auth.decorators import login_required
from django.views.static import serve

from django.urls import reverse
from .models import RCV

import os

from .forms import UploadRCV, XMLRequestForm

from .models import RCV

def test(request):
    return HttpResponse("HELLO")

def index(request):
    rcv_list = RCV.objects.all()

    return render(
        request,
        'p_list/index.html',
        context = {"rcv_list": rcv_list,}
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

@login_required
def check_files_to_model(request):
    path="./unproc_rcv/"
    rcv_list = os.listdir(path)

    # print(os.getcwd())

    for rcv_name in rcv_list:
        with open(path + rcv_name, 'rb') as localfile:
        # print("LOCAL:", localfile)
            result = RCV.objects.filter(filename=rcv_name)
            if not result:
                djangoFile = File(localfile)
                rcv = RCV(filename=rcv_name)
                rcv.rcvfile.save(rcv_name, djangoFile)
                # rcv.save()

    # rcv_string = ''
    # rcv_list = RCV.objects.all()
    # for rcv in rcv_list:
    #     rcv_string += rcv.filename
    return HttpResponse("")

def delete(request):
    form = XMLRequestForm(request.POST)
    if form.is_valid():
        command = form.cleaned_data['command']
        rcv_filename = form.cleaned_data['rcv_filename']
    if request.user.is_authenticated:
        rcv_instance = RCV.objects.filter(filename=rcv_filename)
        rcv_instance.delete()
        message = rcv_filename
    else:
        message = 0
    return HttpResponse(message)