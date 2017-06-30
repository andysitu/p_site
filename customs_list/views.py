from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from .models import CustomsDeclaraction
from .forms import UploadCustomsDeclaration
from django.contrib.auth.decorators import login_required
import re, os
import PyPDF2
from django.core.files import File
from django.conf import settings
from django.utils.encoding import smart_str

def test(request):
    return HttpResponse("HELLO")

@login_required
def upload(request):
    if request.method == 'POST':
        uploadform = UploadCustomsDeclaration(request.POST, request.FILES,)
        if uploadform.is_valid():
            num_regex = re.compile('F\s*T\s*[\s\w\d]{9,}T\s*W')
#
#
            for file in request.FILES.getlist('customs_file'):
                print(type(file))
                pdfReader = PyPDF2.PdfFileReader(file)

                for pageNum in range(0, pdfReader.numPages):
                    pageObj = pdfReader.getPage(pageNum)
                    text = pageObj.extractText()
                    re_results = re.findall(num_regex, text)
                    print(re_results)
                    for res in re_results:
                        print(res.replace(' ', ''))
                    customs_number = re_results[0]
                    filename = re_results[0] + '.pdf'

                    pdfWriter = PyPDF2.PdfFileWriter()
                    pdfWriter.addPage(pageObj)
                    pdfOutputFile = open("media/" + filename, 'wb')
                    pdf_file = pdfWriter.write(pdfOutputFile)

                    reopen_file = open('media/' + filename, 'rb')
                    django_file = File(reopen_file)
                    customs_declaration = CustomsDeclaraction(customs_file=django_file,
                                                              customs_number=customs_number,
                                                              filename=filename)
                    customs_declaration.save()

                    os.remove(os.path.join(settings.MEDIA_ROOT, filename))

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


def list_all(request):
    customs_all_list = CustomsDeclaraction.objects.all()
    return render(
        request,
        'customs_list/view_files.html',
        context={
            'customs_list': customs_all_list,
        }
    )