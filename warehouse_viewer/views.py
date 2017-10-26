from django.shortcuts import render
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse

from .forms import UploadFile

from warehouse_data import processor as processor

def viewer(request):
    return render(
        request,
        'warehouse_viewer/viewer.html',
        context={}
    )

def upload(request):
    uploadForm = UploadFile()

    date_inst_list = processor.get_datadates(20)

    date_list = []
    for data_date in date_inst_list:
        date_list.append(data_date.date.astimezone().strftime("%m/%d/%Y-%I:%M%p"))

    return render(
        request,
        'warehouse_viewer/upload.html',
        context={
            "date_list": date_list,
            "upload_form": uploadForm,
        }
    )

def upload_excel(request):
    if request.method == 'POST':
        file = request.FILES.getlist("excel_file")
    return HttpResponse(file)

# @login_required
# def upload_excel_data(request):
#
#
#         response_excel_data_form = UploadExcelData(request.POST, request.FILES)
#         if response_excel_data_form.is_valid():
#             for file in request.FILES.getlist("excel_data_file"):
#             # file = request.FILES["excel_data_file"]
#                 upload_response = processor.process_excel_file(file)
#
#     upload_excel_data_form = UploadExcelData()
#
#     date_list = []
#     for data_date in date_inst_list:
#         date_list.append(data_date.date.astimezone().strftime("%m/%d/%Y-%I:%M%p"))
#
#     return render(
#         request,
#         'warehouse_map/upload_excel_data.html',
#         context={
#             "upload_form": upload_excel_data_form,
#             "date_list": date_list,
#             "upload_response": upload_response,
#         }
#     )
