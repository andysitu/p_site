from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.core.files import File

from django.contrib.auth.decorators import login_required
from django.views.static import serve

from django.urls import reverse
from .models import RCV

import os, re, datetime

from .forms import UploadRCV, XMLRequestForm

from django.utils.translation import gettext_lazy
from django.utils import translation


def test(request):
    user_language = 'zh-cn'
    translation.activate(user_language)
    request.session[translation.LANGUAGE_SESSION_KEY] = user_language
    output = gettext_lazy("Hello")
    return HttpResponse(output)

def index(request, year=None, month=None,):
    rcv_list = None
    year_list = None
    month_list = None
    if year == None:
        year_list = []
        query_list = RCV.objects.dates('date', 'year')
        for d in query_list:
            year_list.append(d.year)
    elif month == None:
        month_list = []
        query_list = RCV.objects.dates('date', 'month')
        for d in query_list:
            month_list.append(d.month)
    else:
        rcv_list = RCV.objects.filter(date__year=year, date__month=month)

    return render(
        request,
        'p_list/index.html',
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
        'p_list/index.html',
        context = { "rcv_list": rcv_list,}
    )

def download_rcv(request, rcv_name):
    filepath = './media/rcv/' + rcv_name

    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

@login_required
def upload_file(request):
    if request.method == 'POST':
        rcvform = UploadRCV(request.POST, request.FILES)
        if rcvform.is_valid():
            # form hands request.FILES
            for file in request.FILES.getlist('rcvfile'):
                filename = file.name

                pattern = re.compile('(?P<year>\d\d)(?P<month>\d\d)(?P<day>\d\d)')

                re_result = pattern.search(filename)
                print(re_result)
                year = int("20" + re_result.group("year"))
                month = int(re_result.group("month"))
                day = int(re_result.group("day"))

                d = datetime.date(year, month, day)

                rcv = RCV(rcvfile=file, filename=filename, date=d)
                rcv.save()
            # rcvform.save()

            return HttpResponseRedirect(reverse('p_list:upload'))
    else:
        rcvform = UploadRCV()

    rcvs = RCV.objects.all()

    return render(
        request,
        'p_list/upload.html',
        context={'rcvs': rcvs, 'rcvform': rcvform,}
    )

@login_required
def check_files_to_model(request):
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