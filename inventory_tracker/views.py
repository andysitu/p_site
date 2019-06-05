from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import *

def index(request):
    purchase_q = Purchase.objects.all()
    return render(
        request,
        'inventory_tracker/view_inv.html',
        context={
            'purchases': purchase_q,
        },
    )

    
def create_inv(request):
    return render(
        request,
        'inventory_tracker/create_inv.html',
        context={},
    )