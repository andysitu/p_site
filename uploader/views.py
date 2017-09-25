from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

from django.contrib.auth.decorators import login_required
from django.core.files import File

from .forms import UploadFile

def view_files(request):
    return render(
        request,
        "uploader/view_files.html",
        {}
    )

@login_required
def upload_file(request):
    if request.method == 'POST':
        uploadfile_form = File(request.POST, request.FILES,)
        if uploadfile_form.is_valid():
            # form hands request.FILES
            for file in request.FILES.getlist('rcvfile'):
                filename = file.name

                rcv = RCV(rcvfile=file, filename=filename, rcv_date=d)
                rcv.save()

            return HttpResponseRedirect(reverse('uploader:upload'))
    else:
        uploadfile_form = UploadFile()

    return render(
        request,
        'uploader/upload.html',
        context={
            "uploadfile_form": uploadfile_form,
        }
    )