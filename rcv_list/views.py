from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.core.files import File

from django.contrib.auth.decorators import login_required
from django.views.static import serve

from django.urls import reverse
from .models import RCV

import os, re, datetime, random
from django.conf import settings
import PyPDF2

from .forms import UploadRCV, XMLRequestForm, UploadRCVs, EditRCVName

from django.utils.translation import gettext
from django.utils import translation

def get_foldername():
    return 'rcv'

def test(request):
    user_language = 'zh-cn'
    translation.activate(user_language)
    request.session[translation.LANGUAGE_SESSION_KEY] = user_language
    output = gettext("Hello")
    return HttpResponse(output)


def index(request, year=None, month=None,):
    rcv_list = None
    year_list = None
    month_list = None
    if year == None:
        year_list = []
        query_list = RCV.objects.dates('rcv_date', 'year')
        for d in query_list:
            year_list.append(d.year)
    elif month == None:

        month_list = []
        query_list = RCV.objects.dates('rcv_date', 'month')
        for d in query_list:
            month_list.append(d.month)
    else:
        rcv_list = RCV.objects.filter(rcv_date__year=year, rcv_date__month=month)

    return render(
        request,
        'rcv_list/index.html',
        context = { "rcv_list": rcv_list,
                    "year_list": year_list,
                    "month_list": month_list,
                    "year_url": year,
                    "month_url": month}
    )

def all_index(request):

    rcv_list = RCV.objects.all()

    return render(
        request,
        'rcv_list/index.html',
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

@login_required
def upload_file(request):
    if request.method == 'POST':
        rcvform = UploadRCV(request.POST, request.FILES,)
        if rcvform.is_valid():
            # form hands request.FILES
            for file in request.FILES.getlist('rcvfile'):
                filename = file.name

                pattern = re.compile('(?P<year>\d\d)(?P<month>\d\d)(?P<day>\d\d)')
                re_result = pattern.search(filename)

                year = int("20" + re_result.group("year"))
                month = int(re_result.group("month"))
                day = int(re_result.group("day"))

                d = datetime.date(year, month, day)

                rcv = RCV(rcvfile=file, filename=filename, rcv_date=d)
                rcv.save()
            # rcvform.save()

            return HttpResponseRedirect(reverse('rcv_list:upload'))
    else:
        rcvform = UploadRCV()

    rcvs = RCV.objects.all()

    return render(
        request,
        'rcv_list/upload.html',
        context={'rcvs': rcvs, 'rcvform': rcvform,}
    )

def upload_or_match_pdf(file_exist_status, filename, pdfReader, page_range=None, page=None):
    merger = PyPDF2.PdfFileMerger()
    rcv_foldername = get_foldername()
    filepath = os.path.join(settings.MEDIA_ROOT, rcv_foldername, filename)

    if file_exist_status:
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



def add_get_rcv_instance(rcv_number, filename, year=None, month=None, day=None):
# Returns an RCV instance if a new one was created,
#   returns the filename string if one already exists

    rcv_query = RCV.objects.filter(rcv_number=rcv_number)
    if len(rcv_query) == 0:
        if year!=None:
            d = datetime.date(year, month, day)
            rcv_instance = RCV(rcv_number=rcv_number,
                               filename=filename,
                               rcv_date=d,
                               correct_name=True
                               )
            rcv_instance.save()
        else:
            rcv_instance = RCV(rcv_number=rcv_number,
                               filename =filename)
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
            rcv_re = re.compile('(RCV|RECV)(\d{2})(\d{2})(\d{2})\-\d{4}')

            for file in request.FILES.getlist('rcv_batchfile'):

                pdfReader = PyPDF2.PdfFileReader(file)

                for pageNum in range(0, pdfReader.numPages):
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
                        rcv_number = '00' + str(random.randint(1, 99999999999999))

                    filename = rcv_number + '.pdf'
                    response = add_get_rcv_instance(rcv_number, filename, year, month, day)
                    if type(response) == str:
                        file_exist_status = True
                    else:
                        file_exist_status = False

                    upload_or_match_pdf(file_exist_status, filename, pdfReader, page=pageNum)

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

def delete(request):
    form = XMLRequestForm(request.POST)
    if form.is_valid():
        command = form.cleaned_data['command']
        rcv_filename = form.cleaned_data['rcv_filename']
        if request.user.is_authenticated:
            rcv_instance = RCV.objects.filter(filename=rcv_filename)
            rcv_instance.delete()
            message = rcv_filename
    else:
        message = 0
    return HttpResponse(message)

@login_required
def edit_name(request, filename):
    queryset = RCV.objects.filter(filename=filename)

    old_rcv_inst = get_object_or_404(queryset)

    if request.method=='POST':
        rcv_editform = EditRCVName(request.POST)
        if rcv_editform.is_valid():
            rcv_number = rcv_editform.cleaned_data['rcv_number']

            check_inst_query = RCV.objects.filter(rcv_number=rcv_number)

            if check_inst_query != None:
                check_inst = check_inst_query[0]
                old_rcv_filepath = old_rcv_inst.get_filepath()
                new_rcv_filepath = check_inst.get_filepath()

                old_file = open(old_rcv_filepath, 'rb')
                old_pdfReader = PyPDF2.PdfFileReader(old_file)


                upload_or_match_pdf(True, new_rcv_filepath, old_pdfReader, page_range=None)
                old_rcv_inst.delete()
            else:
                old_rcv_inst.edit(rcv_number)

            prev_url = request.session["prev_url"]

            return HttpResponseRedirect(prev_url)
    else:
        prev_url = request.META.get('HTTP_REFERER')
        request.session["prev_url"] = prev_url
        rcv_editform = EditRCVName()

    return render(request,
                  'rcv_list/edit.html',
                  context={
                      'filename': filename,
                      'form': rcv_editform
                  })