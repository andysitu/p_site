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
        date_list.append(data_date.date.astimezone())
    return JsonResponse({"date_id_list": date_id_list,
                         "date_list": date_list,}
                        , safe=False)



def get_grid_ajax(request):
    loclet_list = request.GET.getlist("loc[]", None)
    loc_list = []
    for locLetter in loclet_list:
        loc_list.append(views.get_grid_map(locLetter))
    return JsonResponse(loc_list, safe=False)

def get_map_search_info(request):
    location_map = request.POST.getlist("location_map[]")
    data_type = request.POST["data_type"]
    level = request.POST["level"]

    return JsonResponse(location_map, safe=False)