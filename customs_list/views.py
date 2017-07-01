from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from .models import CustomsDeclaration
from .forms import UploadCustomsDeclaration
from django.contrib.auth.decorators import login_required
import re, os
import PyPDF2
from django.core.files import File
from django.conf import settings
from django.utils.encoding import smart_str

def test(request, file_name):
    return HttpResponse(file_name)

def customs_file_save_location():
    return 'customs_declaration'

@login_required
def upload(request):
    if request.method == 'POST':
        uploadform = UploadCustomsDeclaration(request.POST, request.FILES,)
        if uploadform.is_valid():
            num_regex = re.compile('F\s*T\s*[\s\w\d]{9,}T\s*W')
#
#
            for file in request.FILES.getlist('customs_file'):

                pdfReader = PyPDF2.PdfFileReader(file)

                for pageNum in range(0, pdfReader.numPages):
                    cus_file_save_folder = customs_file_save_location()
                    pageObj = pdfReader.getPage(pageNum)
                    text = pageObj.extractText()
                    re_results = re.findall(num_regex, text)
                    print(re_results)
                    for res in re_results:
                        print(res.replace(' ', ''))
                    customs_number = re_results[0]
                    filename = re_results[0] + '.pdf'

                    query_list = CustomsDeclaration.objects.filter(filename=filename)
                    if len(query_list) == 0:
                        pdfWriter = PyPDF2.PdfFileWriter()
                        pdfWriter.addPage(pageObj)
                        pdfOutputFile = open(os.path.join(settings.MEDIA_ROOT, cus_file_save_folder, filename), 'wb')
                        pdfWriter.write(pdfOutputFile)

                        # reopen_file = open('media/' + filename, 'rb')
                        # djangofile = File(reopen_file)
                        customs_declaration = CustomsDeclaration(filename=filename,
                                                                 customs_number=customs_number,
                                                                 )
                        customs_declaration.save()
                        # reopen_file.close()

                        # os.remove(os.path.join(settings.MEDIA_ROOT, filename))

                        pdfOutputFile.close()
                    else:
                        # DISPLAY ERROR MESSAGE THAT FILE ALREADY EXISTS THROUGH JS
                        pass

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
    customs_all_list = CustomsDeclaration.objects.all()
    return render(
        request,
        'customs_list/view_files.html',
        context={
            'customs_list': customs_all_list,
        }
    )