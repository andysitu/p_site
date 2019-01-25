from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import Tracking_Number, TrackingType
from django.db.models import Q

def home(request):
    # Temp. View Function
    return render(
        request,
        'shipment_track/input_page.html',
        context={},
    )

def search_page(request):
    return render(
        request,
        'shipment_track/search_tracking.html',
        {}
    )

def submit_tracking_ajax(request):
    tracking_dic = {
        "tracking_type_id": request.POST.get('trackingType'),
        "tracking_number": request.POST.get('trackingNumber'),
        "typeName": request.POST.get("typeName"),
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

def postAjaxCommand(request):
    ajax_command = request.POST.get('ajax_command')

    if ajax_command == "delete_tracking_num":
        tracking_id = request.POST.get("id")
        Tracking_Number.delete_by_id(tracking_id)
    elif ajax_command == "createTrackingType":
        typeName = request.POST.get("typeName")
        
        t = TrackingType(name=typeName)
        t.save()

        return JsonResponse({
            "typeName": typeName,
            "typeId": t.pk,
        })
    elif ajax_command == "getTrackingData":
        data = searchData(request)
        return data

    return JsonResponse({})

def searchData(request):
    dataObj = {}
    filterStatus = False

    trackingQuery = Tracking_Number.objects.get_queryset()

    trackingTypeId = request.POST.get("trackingType")
    if (trackingTypeId != "all"):
        trackingQuery = trackingQuery.filter(tracking_type__id=trackingTypeId)
        filterStatus = True

    if (not filterStatus):
        trackingQuery = trackingQuery.all()

    for t in trackingQuery:
        dataObj[t.id] = t.get_data_obj()

    return JsonResponse(dataObj)