from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import Tracking_Number, TrackingType

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
    note = request.POST.get('note')

    tracking_dic = {
        "tracking_type": request.POST.get('trackingType'),
        "tracking_number": request.POST.get('trackingNumber'),
        "note": request.POST.get('note')
    }
    tracking_data_obj = Tracking_Number.create(tracking_dic)
    return JsonResponse(tracking_data_obj)

def get_tracking_data_ajax(request):
    tracking_data = Tracking_Number.get_data()
    return JsonResponse(tracking_data)

def get_types_ajax(request):
    types_dict = TrackingType.get_types()
    return JsonResponse(types_dict, safe=False)