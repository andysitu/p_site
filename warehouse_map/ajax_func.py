from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from .forms import UploadExcelData, XMLRequestGridForm
from .models import GridMap

from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder
import json

from . import views

from warehouse_data import processor as processor

def get_proc_dates(request):
    data_dates = processor.get_datadates()
    date_id_list = []
    date_list = []

    for data_date in data_dates:
        date_id_list.append(data_date.id)
        date_list.append(data_date.date.astimezone().strftime("%m/%d/%Y-%I:%M%p"))
    return JsonResponse({"date_id_list": date_id_list,
                         "date_list": date_list,},
                        safe=False)

def get_grid_ajax(request):
    loclet_list = request.GET.getlist("loc[]", None)
    loc_list = []
    for locLetter in loclet_list:
        loc_list.append( views.get_grid_map(locLetter) )
    return JsonResponse(loc_list, safe=False)

def get_map_search_info(request):
    """
    Reads data from settings and returns a JsonReponse
      of the corresponding data needed.
    :param request:
    :return: JsonResponse
    """
    # location_map = request.POST.getlist("location_map[]")
    data_type = request.POST.get("data_type")
    level = request.POST.get("level")
    date_1_id = request.POST.get("date_1_inst_id")
    date_2_id = request.POST.get("date_2_inst_id")
    loc = request.POST.get("loc")

    data_dic = {}
    if data_type == "Item Count":
        data_dic = processor.get_item_count_map(loc, date_1_id, level)
    elif data_type == "Items Shipped":
        data_dic = processor.get_item_shipped_map(loc, date_1_id, date_2_id, level)

    return JsonResponse(data_dic, safe=False)