from django.shortcuts import render

# Create your views here.
def help(request):
    return render(
        request,
        'help/help_main.html',
    )

def warehouse_viewer_upload(request):
    return render(
        request,
        'help/warehouse_viewer_upload.html',
    )