from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from .models import CustomsDeclaration, RCV
from .forms import UploadCustomsDeclaration, XMLRequestForm
from django.contrib.auth.decorators import login_required
import re, os, random
import PyPDF2
from django.core.files import File
from django.conf import settings
from django.utils.encoding import smart_str

from django.core.urlresolvers import reverse

from .forms import EditCustomsDeclarationForm

def test(request, file_name):
    return HttpResponse(file_name)

def customs_file_save_location():
    return 'customs_declaration'
def rcv_file_save_location():
    return 'rcv'

@login_required
def upload(request):
    if request.method == 'POST':
        uploadform = UploadCustomsDeclaration(request.POST, request.FILES,)
        if uploadform.is_valid():
            cust_decl_regex = re.compile('\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d')
            rcv_regex = re.compile('RCV\d{6}-\d{4}')

            upload_date = uploadform.cleaned_data["upload_date"]

            for file in request.FILES.getlist('customs_file'):

                pdfReader = PyPDF2.PdfFileReader(file)

                for pageNum in range(0, pdfReader.numPages):
                    cus_file_save_folder = customs_file_save_location()
                    pageObj = pdfReader.getPage(pageNum)
                    text = pageObj.extractText()
                    correct_name = False
                    customs_number = ''

                    # Search for Customs Declaration Number
                    cust_decl_re_results = re.search(cust_decl_regex, text)

                    if cust_decl_re_results != None:
                        customs_number = cust_decl_re_results.group(0).replace(' ', '')
                        correct_name = True
                    else:
                        customs_number = '00' + str(random.randint(1, 99999999999999))

                    # query_list = CustomsDeclaration.objects.filter(customs_number=customs_number)

                    pdfWriter = PyPDF2.PdfFileWriter()
                    pdfWriter.addPage(pageObj)

                    filename = customs_number + '.pdf'

                    pdfOutputFile = open(os.path.join(settings.MEDIA_ROOT, cus_file_save_folder, filename), 'wb')
                    pdfWriter.write(pdfOutputFile)
                    customs_declaration = CustomsDeclaration(filename=filename,
                                                             customs_number=customs_number,
                                                             correct_name=correct_name,
                                                             upload_date=upload_date,
                                                             )
                    customs_declaration.save()

                    pdfOutputFile.close()
    else:
        uploadform = UploadCustomsDeclaration()
    return render(
        request,
        'customs_list/upload.html',
        context={
            "uploadform": uploadform,
        }
    )

def download_customs_pdf(request, file_name, view_pdf=False):
    cus_file_save_folder = customs_file_save_location()

    customs_model = CustomsDeclaration.objects.get(filename=file_name)
    path_to_file = os.path.join(settings.MEDIA_ROOT, cus_file_save_folder, file_name)
    # path_to_file = '/media/' + file_name
    # with open(os.path.join(settings.MEDIA_ROOT, cus_file_save_folder, file_name), 'rb') as pdf:
    #     response=HttpResponse(pdf.read(), content_type='application/pdf')
    response = HttpResponse()
    response['Content-Length'] = os.path.getsize(os.path.join(settings.MEDIA_ROOT, cus_file_save_folder, file_name))
    response['Content-Type'] = 'application/pdf'
    if view_pdf:
        response['Content-Disposition'] = 'inline; filename=%s' % file_name
    else:
        response['Content-Disposition'] = 'attachment; filename=%s' % file_name
    response['X-Accel-Redirect'] = "/media/" +  cus_file_save_folder + '/' + file_name
    return response

def view_customs_pdf(request, file_name):
    return download_customs_pdf(request, file_name, view_pdf=True)

def list_all(request):
    customs_all_list = CustomsDeclaration.objects.order_by('filename')
    return render(
        request,
        'customs_list/view_files.html',
        context={
            'customs_list': customs_all_list,
        }
    )

def list_date(request, year=None, month=None, day=None):
    customs_list = None
    day_list = None
    year_list = None
    month_list = None
    if year != None and month != None and day != None:
        customs_list = CustomsDeclaration.objects.filter(upload_date__year=year,
                                                         upload_date__month=month,
                                                         upload_date__day=day,)
        return render(
            request,
            'customs_list/view_files.html',
            context={
                'customs_list': customs_list,
                'year': year,
                'day': day,
                'month': month,
            }
        )
    else:
        if year == None:
            year_list = []
            query_list = CustomsDeclaration.objects.dates("upload_date", "year")
            for q in query_list:
                year_list.append(q.year)
        elif month == None:
            month_list = []
            query_list = CustomsDeclaration.objects.filter(upload_date__year=year).dates("upload_date", "month")
            for q in query_list:
                month_list.append(q.month)
        else:
            day_list = []
            query_list = CustomsDeclaration.objects.filter(upload_date__year=year, upload_date__month=month).dates("upload_date", "day")
            for q in query_list:
                day_list.append(q.day)

        return render(
            request,
            'customs_list/view_dates.html',
            context={
                'year_list': year_list,
                'month_list': month_list,
                'day_list': day_list,
                'day': day,
                'year': year,
                'month': month,
            }
        )


def delete(request):
    form = XMLRequestForm(request.POST)
    message = ''
    if form.is_valid():
        command = form.cleaned_data['command']
        filename = form.cleaned_data['filename']
        if request.user.is_authenticated:
            custdecl_inst = CustomsDeclaration.objects.get(filename=filename)
            custdecl_inst.delete()
            message = filename
        else:
            return HttpResponseRedirect(reverse('login'))
    return HttpResponse(message)

def edit_cust_dec(request, filename):
    queryset = CustomsDeclaration.objects.filter(filename=filename)

    cust_dec_inst = get_object_or_404(queryset)

    if request.method == 'POST':
        cust_dec_editform = EditCustomsDeclarationForm(request.POST)
        if cust_dec_editform.is_valid():

            customs_number = cust_dec_editform.cleaned_data["customs_number"]
            customs_query = CustomsDeclaration.objects.filter(customs_number=customs_number)

            prev_url = request.session["prev_url"]

            # Means that the PDF with the name already exists
            if len(customs_query) != 0:
                cust_dec_inst.delete()
                return HttpResponseRedirect(prev_url)

            cust_dec_inst.edit(
                customs_number=customs_number,
                               )
            return HttpResponseRedirect(prev_url)
    else:
        # upload_date = cust_dec_inst.upload_date
        prev_url = request.META.get('HTTP_REFERER')
        request.session["prev_url"] = prev_url
        cust_dec_editform = EditCustomsDeclarationForm()

    return render(request,
                  'customs_list/cust_dec_edit.html',
                  context={
                      'filename': filename,
                      "form": cust_dec_editform},
                  )