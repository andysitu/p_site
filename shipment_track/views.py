from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import Tracking_Number, TrackingType
import datetime
import json

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

def upload_page(request):
    return render(
        request,
        "shipment_track/upload.html",
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
    elif ajax_command == "getTodaysTrackingData":
        data = todayAllData()
        return data
    elif ajax_command == "uploadEntries":
        uploadEntries(request)

    return JsonResponse({})

def todayAllData():
    dataObj = {}
    trackingQuery = Tracking_Number.objects.get_queryset()
    parsed_stateDate = datetime.datetime.utcnow().date()
    parsed_endDate = datetime.datetime.utcnow().date()
    parsed_endDate += datetime.timedelta(days=1)
    
    trackingQuery = trackingQuery.filter(receive_date__gte=parsed_stateDate)
    trackingQuery = trackingQuery.filter(receive_date__lte=parsed_endDate)

    for t in trackingQuery:
        dataObj[t.id] = t.get_data_obj()

    return JsonResponse(dataObj)

def uploadEntries(request):
    entriesJsonArr = request.POST.get("entriesJsonArr")
    entriesArr = json.loads(entriesJsonArr)
    for i in range(0, len(entriesArr)):
        entryObj = entriesArr[i]
        
        trackingTypeID = entryObj["trackingTypeID"]

        trackingNum = entryObj["trackingNum"]
        receiveDateObj = entryObj["receiveDateObj"]
        year = int(receiveDateObj["year"])
        day = int(receiveDateObj["day"])
        month = int(receiveDateObj["month"])
        receive_date = datetime.datetime(year, month, day, 9, 0)

        tracking_type = TrackingType.objects.get(id = trackingTypeID)
        t = Tracking_Number(
            number = trackingNum,
            receive_date = receive_date,
            tracking_type = tracking_type,
        )
        t.save()


def searchData(request):
    dataObj = {}
    filterStatus = False

    trackingQuery = Tracking_Number.objects.get_queryset()

    trackingTypeId = request.POST.get("trackingType")
    trackingNumber = request.POST.get("trackingNumber")

    if (trackingNumber) and trackingNumber != "":
        trackingQuery = trackingQuery.filter(number__icontains=trackingNumber)

    # Process dates, if they exist
    startDate = request.POST.get("startDate")
    if startDate:
        parsed_stateDate = datetime.datetime.strptime(startDate, "%Y-%m-%d")

    endDate = request.POST.get("endDate")
    if endDate:
        parsed_endDate = datetime.datetime.strptime(endDate, "%Y-%m-%d")

    # Compare which date is later
    if (startDate and endDate ):
        if parsed_stateDate > parsed_endDate:
            tempDate = parsed_stateDate
            parsed_stateDate = parsed_endDate
            parsed_endDate = tempDate
        elif parsed_stateDate == parsed_endDate:
            # If user wants to get just 1 day
            parsed_endDate += datetime.timedelta(days=1)


    if (trackingTypeId != "all"):
        trackingQuery = trackingQuery.filter(tracking_type__id=trackingTypeId)
        filterStatus = True

    if startDate:
        trackingQuery = trackingQuery.filter(receive_date__gte=parsed_stateDate)
    if endDate:
        trackingQuery = trackingQuery.filter(receive_date__lte=parsed_endDate)

    if (not filterStatus):
        trackingQuery = trackingQuery.all()

    for t in trackingQuery:
        dataObj[t.id] = t.get_data_obj()

    return JsonResponse(dataObj)