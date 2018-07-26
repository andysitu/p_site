from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.core.files import File

from django.contrib.auth.decorators import login_required
from django.views.static import serve

from django.urls import reverse
from .models import RCV

import os, re, datetime, random
from django.conf import settings
import PyPDF2, re

from .forms import UploadRCV, XMLRequestForm, UploadRCVs, EditRCVName

from django.utils.translation import gettext
from django.utils import translation

from .models import get_rcv_filepath

def get_foldername():
    return 'rcv'

def search_rcv(request, rcv=None):
    context_dic = {}

    if rcv==None and request.method == "GET":
        rcvs = search_rcv_ajax(request, False)
        context_dic["rcvs"] = rcvs
    elif rcv != None:
        rcv_list = RCV.objects.filter(rcv_number__contains=rcv)
        context_dic["rcv_list"] = rcv_list
    return render(
        request,
        'rcv_list/view_files.html',
        context=context_dic
    )

def search_rcv_ajax(request, ajax=True):
    """
    Search multiple RCVs or 1.
    Ajax or normal python call works.
    :param request:
    :return: {
        search_parameters: [ rcvs: {
         info_parameters...
         }], ... }
    """
    search_text = request.GET.get('search_box', None)
    search_list = re.split('[^\-A-Za-z0-9]+', search_text)

    rcvs = {}
    rcvs_len = len(search_list)

    str_format = "%Y-%m-%d %I:%M:%S %p %Z"

    for x in range(rcvs_len):
        search_term = search_list[x]
        if search_term == "":
            continue

        if search_term not in rcvs:
            rcvs[search_term] = []

        rcv_list = RCV.objects.filter(rcv_number__icontains=search_term)
        if len(rcv_list) > 0:
            rcv_len = len(rcv_list)
            for y in range(rcv_len):
                r = rcv_list[y]
                rcvs[search_term].append({
                    "rcv": r.rcv_number,
                    "filename": r.filename,
                    "original_filename": r.original_filename,
                    "correct_name": r.correct_name,
                    "id": r.pk,
                    "rcv_date": r.rcv_date,
                    "input_date": r.input_date,
                    "upload_date": r.upload_date.strftime(str_format),
                })
    if ajax:
        return JsonResponse(rcvs)
    else:
        return rcvs

def get_date_from_rcvname(rcv_num):
    # Checks if RCV is in proper format and returns datetime if so
    rcv_re = re.compile('(RCV|RECV)(\d{2})(\d{2})(\d{2})-\d{4}')
    re_results = re.search(rcv_re, rcv_num)
    if re_results != None:
        year = int('20' + re_results.group(2))
        month = int(re_results.group(3))
        day = int(re_results.group(4))

        d = datetime.date(year, month, day)
        return d
    else:
        return None

def view_dates(request):
    year_dic = {}
    year_query = RCV.objects.dates("rcv_date", "year")
    for y in year_query:
        cur_year = y.year
        month_query = RCV.objects.filter(rcv_date__year=cur_year).dates("rcv_date", "month")
        month_list = []
        for m in month_query:
            month_list.append(m.month)
        year_dic[cur_year] = month_list

    return render(
        request,
        'rcv_list/view_dates.html',
        context={
            'year_dic': year_dic,
        }
    )

def view_files(request, year, month):
    rcv_list = RCV.objects.filter(rcv_date__year=year,
                                  rcv_date__month=month,).order_by('filename')

    return render(
        request,
        'rcv_list/view_files.html',
        context={
            'rcv_list': rcv_list,
            'year': year,
            'month': month,
        }
    )

def view_edit_list(request):
    edit_list = RCV.objects.filter(correct_name=False)
    return render(
        request,
        'rcv_list/view_files.html',
        context={
            'rcv_list': edit_list,
        }
    )

def all_index(request):

    rcv_list = RCV.objects.all().order_by('filename')

    return render(
        request,
        'rcv_list/view_files.html',
        context = { "rcv_list": rcv_list,}
    )

def download_rcv(request, rcv_filename, view_pdf=False):
    rcv_foldername = get_foldername()
    file_path = os.path.join(settings.MEDIA_ROOT, rcv_foldername, rcv_filename)

    response = HttpResponse()
    response['Content-Length'] = os.path.getsize(os.path.join(settings.MEDIA_ROOT, rcv_foldername, rcv_filename))
    response['Content-Type'] = 'application/pdf'
    if view_pdf:
        response['Content-Disposition'] = 'inline; filename=%s' % rcv_filename
    else:
        response['Content-Disposition'] = 'attachment; filename=%s' % rcv_filename
    response['X-Accel-Redirect'] = "/media/" + rcv_foldername + '/' + rcv_filename
    return response

def view_rcv(request, rcv_filename):
    return download_rcv(request, rcv_filename, view_pdf=True)

def download_rcv_by_id(request, rcv_id, view_pdf=False):
    rcv_foldername = get_foldername()
    r = RCV.objects.get(pk=rcv_id)

    filename = r.filename

    response = HttpResponse()
    response['Content-Length'] = os.path.getsize(os.path.join(settings.MEDIA_ROOT, rcv_foldername, filename))
    response['Content-Type'] = 'application/pdf'
    if view_pdf:
        response['Content-Disposition'] = 'inline; filename=%s' % filename
    else:
        response['Content-Disposition'] = 'attachment; filename=%s' % filename
    response['X-Accel-Redirect'] = "/media/" + rcv_foldername + '/' + filename
    return response

def view_rcv_by_id(request, rcv_id):
    return download_rcv_by_id(request, rcv_id, view_pdf=True)

def add_get_rcv_instance(rcv_number, filename, year=None, month=None, day=None, original_filename="Unknown.pdf", input_date=None):
# Saves the RCV to the model.
# Returns an RCV instance if a new one was created,
#   returns the filename string if one already exists

    rcv_query = RCV.objects.filter(rcv_number=rcv_number)
    if len(rcv_query) == 0:
        try:
            d = datetime.date(year, month, day)
            rcv_instance = RCV(rcv_number=rcv_number,
                               filename=filename,
                               rcv_date=d,
                               correct_name=True,
                               original_filename=original_filename,
                               input_date=input_date,
                               )
        except (ValueError, TypeError) as e:
            rcv_instance = RCV(rcv_number=rcv_number,
                               filename =filename,
                               original_filename=original_filename,
                               input_date=input_date,
                               )

        rcv_instance.save()

        return rcv_instance
    else:
        rcv_instance = rcv_query[0]
        return rcv_instance.filename

@login_required
def upload_files(request):
    if request.method == 'POST':
        rcv_batchform = UploadRCVs(request.POST, request.FILES,)

        if rcv_batchform.is_valid():
            folder_name = get_foldername()
            rcv_re = re.compile('(RCV|RECV)(\d{2})(\d{2})(\d{2})-\d{4}')

            for file in request.FILES.getlist('rcv_batchfile'):
                original_filename = file.name
                pdfReader = PyPDF2.PdfFileReader(file)

                total_pages = pdfReader.getNumPages()

                for pageNum in range(0, total_pages):
                    pageObj = pdfReader.getPage(pageNum)
                    text = pageObj.extractText()
                    rcv_title = None
                    year = None
                    month = None
                    day = None

                    re_results = re.search(rcv_re, text)
                    # print(re_results)
                    if re_results != None:
                        rcv_number = re_results.group(0)
                        rcv_title = re_results.group(1)
                        year = int('20' +re_results.group(2))
                        month = int(re_results.group(3))
                        day = int(re_results.group(4))
                    else:
                        d = datetime.datetime.now()
                        d_year = str(d.year)
                        d_month = str(d.month)
                        d_day = str(d.day)
                        d_hour = str(d.hour)
                        d_min = str(d.minute)
                        d_sec = str(d.second)
                        d_microsec = str(d.microsecond)
                        rcv_number = '00' + d_year + d_month + d_day + d_hour + d_min + d_sec + d_microsec

                    if request.POST.get("input_date_status") == "on":
                        input_date = request.POST.get("input_date")
                    else:
                        input_date = None

                    filename = rcv_number + '.pdf'
                    response = add_get_rcv_instance(rcv_number, filename, year, month, day, original_filename=original_filename,input_date=input_date)
                    if type(response) == str:
                        file_exist_status = True
                    else:
                        file_exist_status = False

                    upload_or_match_pdf(file_exist_status, filename, pdfReader, page=pageNum,)

    else:
        rcv_batchform = UploadRCVs()
    return render(
        request,
        'rcv_list/upload.html',
        context={
            "rcvform": rcv_batchform,
        }
    )

@login_required
def check_files_to_model(request):
    #
    path="./unproc_rcv/"
    rcv_list = os.listdir(path)

    # print(os.getcwd())

    for rcv_name in rcv_list:
        with open(path + rcv_name, 'rb') as localfile:
        # print("LOCAL:", localfile)
            result = RCV.objects.filter(filename=rcv_name)
            if not result:
                djangoFile = File(localfile)
                rcv = RCV(filename=rcv_name)
                rcv.rcvfile.save(rcv_name, djangoFile)
                # rcv.save()

    # rcv_string = ''
    # rcv_list = RCV.objects.all()
    # for rcv in rcv_list:
    #     rcv_string += rcv.filename
    return HttpResponse("")

def delete_ajax(request):
    command = request.POST.get('command')
    rcv_number = request.POST.get('rcv_number')
    message = ""
    if request.user.is_authenticated:
        if command == "delete":
            rcv_instance = RCV.objects.filter(rcv_number=rcv_number)[0]
            rcv_instance.delete()
            message = rcv_number
    return HttpResponse(message)

def upload_or_match_pdf(file_exist_status, filename, pdfReader, page_range=None, page=None):
# Uploads an entire pdf file to the server
    rcv_foldername = get_foldername()
    filepath = os.path.join(settings.MEDIA_ROOT, rcv_foldername, filename)

    if file_exist_status:
        merger = PyPDF2.PdfFileMerger()
        if page != None and page_range == None:
            page_range = (page, page + 1)
        pdfExistOutput = open(filepath, 'rb')
        merger.append(PyPDF2.PdfFileReader(pdfExistOutput))
        merger.append(pdfReader, pages=page_range)
        merger.write(filepath)
        merger.close()
        pdfExistOutput.close()
    else:
        writer = PyPDF2.PdfFileWriter()
        if page != None:
            writer.addPage(pdfReader.getPage(page))
        else:
            start_page = page_range[0]
            end_page = page_range[1]
            for p in range(start_page, end_page):
                writer.addPage(pdfReader.getPage(p))
        pdfOutput = open(filepath, 'wb')
        writer.write(pdfOutput)
        pdfOutput.close()

@login_required
def edit_name(request, filename):
    # Function gives the HTML page to edit files.
    # Editing is done by edit_file_ajax()
    queryset = RCV.objects.filter(filename=filename)

    old_rcv_inst = get_object_or_404(queryset)
    old_rcv_filepath = old_rcv_inst.get_filepath()
    old_file = open(old_rcv_filepath, 'rb')
    old_pdfReader = PyPDF2.PdfFileReader(old_file)
    num_pages = old_pdfReader.numPages
    page_list = [i for i in range(1, num_pages+1)]

    prev_url = request.META.get('HTTP_REFERER')
    request.session["prev_url"] = prev_url

    old_file.close()

    return render(
        request,
        'rcv_list/edit.html',
        context={
          'filename': filename,
          "page_list": page_list,
        }
    )

def edit_file(request, new_rcv_name, filename, pages_list=None):
    existing_rcvfile = None

    old_rcv_inst = RCV.objects.get(filename=filename)
    check_inst_query = RCV.objects.filter(rcv_number=new_rcv_name)

    old_rcv_filepath = old_rcv_inst.get_filepath()
    old_file = open(old_rcv_filepath, 'rb')
    old_pdfReader = PyPDF2.PdfFileReader(old_file)
    old_pdf_numpages = old_pdfReader.numPages

    if pages_list == None or len(pages_list) == 0:
        pages_list = range(1, old_pdf_numpages+1)

    pdfWriter = PyPDF2.PdfFileWriter()

    existing_rcv_status = len(check_inst_query) != 0


    if existing_rcv_status:
        existing_inst = check_inst_query[0]

        existing_rcv_filepath = existing_inst.get_filepath()
        existing_rcvfile = open(existing_rcv_filepath, 'rb')
        existing_rcv_pdfReader = PyPDF2.PdfFileReader(existing_rcvfile)

        for page in range(existing_rcv_pdfReader.numPages):
            pageObj = existing_rcv_pdfReader.getPage(page)
            pdfWriter.addPage(pageObj)

    for page in pages_list:
        pageObj = old_pdfReader.getPage(int(page)-1)
        pdfWriter.addPage(pageObj)

    output_filename = new_rcv_name + ".pdf"
    # output_filename = "output" + ".pdf"
    output_filepath = get_rcv_filepath(output_filename)

    pdfOutputFile = open(get_rcv_filepath("output.pdf"), 'wb')
    pdfWriter.write(pdfOutputFile)

    old_file.close()
    if existing_rcvfile != None:
        existing_rcvfile.close()

    os.rename(get_rcv_filepath("output.pdf"), output_filepath)

    pdfOutputFile.close()

    if len(pages_list) == old_pdfReader.numPages or len(pages_list) == 0 or pages_list == None:
        # If all pages of the old file are being edited
        if existing_rcv_status:
            # All of the pages are being transferred to existing PDF.
            old_rcv_inst.delete()
        else:
            # Can use edit function of instance but this renames file on its own
            old_rcv_inst.edit(new_rcv_name)
    else:
        # Only if some of the pages are being edited.
        # Will recreate old pdf file with only pages not in page_list
        old_pdfWriter = PyPDF2.PdfFileWriter()

        oldfile2 = open(old_rcv_filepath, 'rb')
        old_pdfReader2 = PyPDF2.PdfFileReader(oldfile2)

        for page_num in range(old_pdfReader2.numPages):
            if str(page_num + 1) not in pages_list:
                pageObj = old_pdfReader2.getPage(page_num)
                old_pdfWriter.addPage(pageObj)

        old_pdfOutputFile = open(get_rcv_filepath("output.pdf"), 'wb')
        old_pdfWriter.write(old_pdfOutputFile)
        old_pdfOutputFile.close()

        os.rename(get_rcv_filepath("output.pdf"), old_rcv_filepath)

        if not existing_rcv_status:
            # Create new RCV instance the new RCV does not exists.
            check_response = get_date_from_rcvname(new_rcv_name)
            original_filename = old_rcv_inst.original_filename
            input_date = old_rcv_inst.input_date
            upload_date = old_rcv_inst.upload_date

            if check_response != None:
                new_rcv = RCV(rcv_number=new_rcv_name,
                              filename=output_filename,
                              original_filename=original_filename,
                              input_date=input_date,
                              rcv_date=check_response,
                              correct_name=True,
                              upload_date=upload_date,
                              )
            else:
                new_rcv = RCV(rcv_number=new_rcv_name,
                              filename=output_filename,
                              original_filename=original_filename,
                              input_date=input_date,
                              upload_date=upload_date,
                              )
            new_rcv.save()

    prev_url = request.session["prev_url"]

    return JsonResponse({
        "rcv_name": new_rcv_name,
        # "pages": pages_list,
        "prev_url": prev_url,
        "filename": filename,
    })

def edit_file_ajax(request):
    rcv_name = request.POST.get('rcv_name')
    pages_list = request.POST.getlist("pages[]", None)
    filename = request.POST.get("filename")

    return edit_file(request, rcv_name, filename, pages_list)