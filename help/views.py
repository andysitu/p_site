from django.shortcuts import render

# Create your views here.
def help(request):
    return render(
        request,
        'help/help_main.html',
    )

def help_warehouse_viewer(request):
    return render(
        request,
        'help/warehouse_viewer.html',
    )