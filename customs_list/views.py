from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from .models import CustomsDeclaraction
from .forms import UploadCustomsDeclaration
from django.contrib.auth.decorators import login_required
import re
import PyPDF2

def test(request):
    return HttpResponse("HELLO")

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
                    pageObj = pdfReader.getPage(pageNum)
                    text = pageObj.extractText()
                    re_results = re.findall(num_regex, text)
                    print(re_results)
                    for res in re_results:
                        print(res.replace(' ', ''))
                    filename = re_results[0] + '.pdf'

                    pdfWriter = PyPDF2.PdfFileWriter()
                    pdfWriter.addPage(pageObj)
                    pdfOutputFile = open("media/" + filename, 'wb')
                    pdf_file = pdfWriter.write(pdfOutputFile)
                    pdfOutputFile.close()
                    print(pdfOutputFile)




    else:
        uploadform = UploadCustomsDeclaration()
    return render(
        request,
        'customs_list/upload.html',
        context={
            "uploadform": uploadform,
        }
    )

@login_required
def list_all(request):
    customs_all_list = CustomsDeclaraction.objects.all()
    return render(
        request,
        'customs_list/view_files.html',
        context={
            'customs_list': customs_all_list,
        }
    )