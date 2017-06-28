from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from .models import CustomsDeclaraction
from .forms import UploadCustomsDeclaration

# Create your views here.

def test(request):
    return HttpResponse("HELLO")

def upload(request):
    uploadform = UploadCustomsDeclaration()
    return render(
        request,
        'customs_list/upload.html',
        context={
            "uploadform": uploadform,
        }
    )

def list_all(request):
    customs_all_list = CustomsDeclaraction.objects.all()
    return render(
        request,
        'customs_list/view_files.html',
        context={
            'customs_list': customs_all_list,
        }
    )