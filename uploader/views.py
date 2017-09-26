from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

from django.contrib.auth.decorators import login_required
from django.core.files import File
from django.conf import settings
from django.urls import reverse

from .models import UFileManager, UFile, Note
from .forms import UploadFile

import os

def view_files(request):
    filemanager_list = []
    for file_manager in filemanager_list:
        filemanager_list.append(file_manager.name)

    return render(
        request,
        "uploader/view_files.html",
        {
            "filemanager_list": filemanager_list,
        }
    )

@login_required
def upload_file(request):
    if request.method == 'POST':
        uploadfile_form = UploadFile(request.POST, request.FILES,)
        if uploadfile_form.is_valid():

            # form hands request.FILES
            for file in request.FILES.getlist('file'):
                filename = file.name

                ufilemanager = UFileManager(name=filename)
                ufilemanager.save()

                ufile = UFile(filename=filename, file_manager = ufilemanager)
                ufile.save()

                make_file(file, filename, filename)

            return HttpResponseRedirect(reverse('uploader:upload_file'))
    else:
        uploadfile_form = UploadFile()

    return render(
        request,
        'uploader/upload.html',
        context={
            "uploadfile_form": uploadfile_form,
        }
    )

def make_file(file, filename, folder):
    if not os.path.exists(settings.MEDIA_ROOT):
        os.mkdir(settings.MEDIA_ROOT)
    os.chdir(settings.MEDIA_ROOT)
    if not os.path.exists("uploader"):
        os.mkdir("uploader")
    os.chdir("uploader")
    if not os.path.exists(folder):
        os.mkdir(folder)
    os.chdir(folder)
    filepath = os.path.join(settings.MEDIA_ROOT, "uploader", folder)

    f = open(filename, 'wb')
    f.write(file.read())
    f.close()