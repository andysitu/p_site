from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.core import serializers
from .forms import UploadExcelData
from .models import Test

from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder

from warehouse_data import processor as processor

class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, YourCustomType):
            return force_text(obj)
        return super(LazyEncoder, self).default(obj)

def test(request):
    return HttpResponse("HELLO")

def view_map(request):
    test_dic = {'fire': 'ball'}

    json_data = serializers.serialize('json', Test.objects.all(), cls=LazyEncoder)

    return render(
        request,
        'warehouse_map/map.html',
        context={
            'data_dic': json_data,
        }
    )

def upload_excel_data(request):
    if request.method == 'POST':
        upload_excel_data_form = UploadExcelData(request.POST, request.FILES)
        if upload_excel_data_form.is_valid():
            for file in request.FILES.getlist("excel_data_file"):
            # file = request.FILES["excel_data_file"]
                processor.process_excel_file(file)
    else:
        upload_excel_data_form = UploadExcelData()

    return render(
        request,
        'warehouse_map/upload_excel_data.html',
        context={
            "upload_form": upload_excel_data_form,
        }
    )

def reset_db(request):
    processor.reset_db()
    return redirect("warehouse_map:index")

def reset_db_true(request):
    processor.reset_db(delete_rack=True)
    return redirect("warehouse_map:index")

def compare_dates(request):
    date_list = processor.get_dates()

    return render(
        request,
        "warehouse_map/compare.html",
        context = {
            "date_list": date_list,
        }
    )

def get_info(request):
    d = processor.get_info()

    return render(
        request,
        "warehouse_map/warehouse_info.html",
        context={
            "data_date": d,
        }
    )