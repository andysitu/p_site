from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    # Temp. View Function
    return render(
        request,
        'shipment_track/input_page.html',
        context={},
    )