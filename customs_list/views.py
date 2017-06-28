from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

# Create your views here.

def test(request):
    return HttpResponse("HELLO")

def upload(request):
    return render(
        request,
        'customs_list/upload.html',
    )