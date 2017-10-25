from django.shortcuts import render
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse


from warehouse_data import processor as processor

def viewer(request):
    return render(
        request,
        'warehouse_viewer/viewer.html',
        context={
            
        }
    )