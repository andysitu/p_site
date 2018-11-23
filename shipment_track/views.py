from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

def home(request):
    # Temp. View Function
    return render(
        request,
        'shipment_track/input_page.html',
        context={},
    )

def submit_tracking_ajax(request):
    tracking_type = request.POST.get('trackingType')
    tracking_num = request.POST.get('trackingNumber')
    return JsonResponse(
        {"tracking_type": tracking_type,
        "tracking_number": tracking_num,
        })

def get_tracking_data_ajax(request):
    return JsonResponse({})