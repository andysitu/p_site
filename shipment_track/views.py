from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return render(
        request,
        'shipment_track/input_page.html',
        context={},
    )