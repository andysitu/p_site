from django.shortcuts import render
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse


from warehouse_data import processor as processor

def viewer(request):
    return render(
        request,
        'warehouse_viewer/viewer.html',
        context={}
    )

def upload(request):
    date_inst_list = processor.get_datadates(20)

    date_list = []
    for data_date in date_inst_list:
        date_list.append(data_date.date.astimezone().strftime("%m/%d/%Y-%I:%M%p"))

    return render(
        request,
        'warehouse_viewer/upload.html',
        context={
            "date_list": date_list,
        }
    )

def upload_excel(request):
    return HttpResponse("HI")