from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# Create your views here.
def help(request):
    return render(
        request,
        'help/help_main.html',
    )

def warehouse_viewer_upload(request):
    return render(
        request,
        'help/warehouse_viewer_upload.html',
    )

def warehouse_viewer(request):
    return render(
        request,
        'help/warehouse_viewer.html',
    )

def forklift(request):
    return render(
        request,
        'help/forklift.html',
    )

def scansnap(request):
    return render(
        request,
        'help/scansnap.html',
    )

def rcv_upload(request):
    return render(
        request,
        'help/rcv_upload.html',
    )