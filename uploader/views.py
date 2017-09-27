from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

from django.contrib.auth.decorators import login_required
from django.core.files import File
from django.conf import settings
from django.urls import reverse

from .models import UFileManager, UFile, Note
from .forms import UploadFile

import urllib

import os, re

from django.utils.encoding import smart_str

def view_files(request):

    filemanagers = UFileManager.objects.all()

    return render(
        request,
        "uploader/view_files.html",
        context={
            "filemanager_list": filemanagers,
        }
    )

@login_required
def upload_file(request):
    if request.method == 'POST':
        uploadfile_form = UploadFile(request.POST, request.FILES,)
        if uploadfile_form.is_valid():

            name = request.POST["name"]
            note = request.POST["note"]

            if note != "":
                n = Note(text=note)
                n.save()

            file_ext_re = re.compile('(\..+)$')

            # form hands request.FILES
            for file in request.FILES.getlist('file'):
                filename = file.name
                print(file_ext_re.search(filename))
                file_ext = file_ext_re.search(filename).group(0)

                if file_ext == None:
                    file_ext = ""

                ufilemanager = UFileManager(name=name)
                ufilemanager.save()

                ufile = UFile(filename=filename, file_manager = ufilemanager, file_extensions=file_ext)
                ufile.save()

                make_file(file, filename=str(ufile.id) + file_ext, folder=str(ufilemanager.id))

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

def download_file(request, filemanager_id):
    filemanager = UFileManager.objects.get(id=filemanager_id)
    ufiles = filemanager.ufile_set.all()

    ufile = ufiles[0]
    filename = ufile.filename
    filepath = os.path.relpath(ufile.get_filepath())
    # print(filename.encode('utf-8'), filemanager.name.encode('utf-8'))


    response = HttpResponse(content_type='application/force-download; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename.encode("unicode-escape").decode('unicode-escape')
    print(filename.encode("unicode-escape").decode("unicode-escape"))
    print('attachment; filename="%s"' % filename.encode("unicode-escape").decode('unicode-escape'))
    response['X-Accel-Redirect'] = "/media/uploader/" + str(filemanager.id) + "/" + str(ufile.id) + ufile.file_extensions
    return response