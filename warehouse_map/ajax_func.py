from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from .forms import UploadExcelData, XMLRequestGridForm
from .models import Test, GridMap

from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder
import json

from . import views

def get_proc_dates(request):
    pass

def get_grid_ajax(request):
    loclet_list = request.GET.getlist("loc[]", None)
    loc_list = []
    for locLetter in loclet_list:
        loc_list.append(views.get_grid_map(locLetter))
    return JsonResponse(loc_list, safe=False)