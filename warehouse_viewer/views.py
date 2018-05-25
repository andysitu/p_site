from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse

from .forms import UploadFile

from warehouse_data import processor as processor
from warehouse_data import views as warehouse_data_views

def viewer(request):
    return render(
        request,
        'warehouse_viewer/viewer.html',
        context={},
    )

def adv_search(request):
    return render(
        request,
        'warehouse_viewer/adv_search.html',
        context={},
    )

def upload(request):
    uploadForm = UploadFile()
    msg = "none"

    if request.method == 'POST':
        file = request.FILES["excel_file"]
        response = processor.process_excel_file(file)
        if response == 0:
            msg = file.name
        else:
            msg = response

    date_inst_list = processor.get_datadates(100)

    date_list = []
    for data_date in date_inst_list:
        date_list.append(data_date.date.astimezone().strftime("%m/%d/%Y-%I:%M%p"))

    return render(
        request,
        'warehouse_viewer/upload.html',
        context={
            "date_list": date_list,
            "upload_form": uploadForm,
            "msg": msg,
        }
    )

def search_ajax(request):
    data_mode = request.GET.get("mode")
    data_type = request.GET.get("data-type")
    response = {}

    if data_mode == "map":
        if data_type == "item_count":
            response = warehouse_data_views.get_item_count(request)
        elif data_type == "item_weight":
            response = warehouse_data_views.get_item_weight(request)
        elif data_type == "item_added":
            response = warehouse_data_views.get_item_added(request)
        elif data_type == "item_shipped":
            response = warehouse_data_views.get_item_shipped(request)
    elif data_mode == "chart":
        if data_type == "added_item_over_time":
            response = warehouse_data_views.get_added_items_over_time(request)
        elif data_type == "total_item_info":
            response = warehouse_data_views.get_total_item_info(request)
        elif data_type == "total_item_over_time":
            response = warehouse_data_views.number_items_over_time(request)
        elif data_type == "item_type_filter":
            response = warehouse_data_views.item_type_filter(request)
        elif data_type == "item_type_over_time":
            response = warehouse_data_views.item_type_over_time(request)
        elif data_type == "num_customers_over_time":
            response = warehouse_data_views.num_customers_over_time(request)
        elif data_type == "items_shipped_over_time":
            response = warehouse_data_views.items_shipped_over_time(request)
    return JsonResponse(response)

def adv_search_ajax(request):
    response = warehouse_data_views.adv_search(request)
    return JsonResponse(response)