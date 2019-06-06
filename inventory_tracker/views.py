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

def view_payment(request):
    return render(
        request,
        'inventory_tracker/inventory_payment.html',
        context={},
    )

def view_vendor(request):
    return render(
        request,
        'inventory_tracker/inventory_vendor.html',
        context={},
    )

def view_dept(request):
    return render(
        request,
        'inventory_tracker/inventory_department.html',
        context={},
    )


# AJAX COMMANDS
def get_payment_ajax(request):
    payment_q =Payment.objects.all()
    payments_obj = {}

    for p in payment_q:
        payment_obj = {}
        payment_obj["id"] = p.pk
        payment_obj["name"] = p.name
        payments_obj[p.pk] = payment_obj
    
    return JsonResponse(payments_obj)

def submit_payment_ajax(request):
    payment_name = request.POST.get('payment_name')
    p = Payment(name = payment_name)
    p.save()

    return JsonResponse({})

def get_vendor_ajax(request):
    vendors_q = Vendor.objects.all()
    vendors_obj = {}

    for v in vendors_q:
        vendor_obj = {}
        vendor_obj["id"] = v.pk
        vendor_obj["name"] = v.name
        vendor_obj["url"] = v.url
        vendors_obj[v.pk] = vendor_obj
    
    return JsonResponse(vendors_obj)

def submit_vendor_ajax(request):
    vendor_name = request.POST.get('vendor_name')
    vendor_url = request.POST.get("vendor_url")
    v = Vendor(name=vendor_name, url=vendor_url)
    v.save()

    return JsonResponse({})

def get_department_ajax(request):
    department_q = Department.objects.all()
    departments_obj = {}

    for d in department_q:
        department_obj = {}
        department_obj["id"] = d.pk
        department_obj["name"] = d.name
        department_obj["location"] = d.location
        departments_obj[d.pk] = department_obj
    
    return JsonResponse(departments_obj)

def submit_department_ajax(request):
    department_name = request.POST.get('department_name')
    department_location = request.POST.get("department_location")
    d = Department(name=department_name, location=department_location)
    d.save()

    return JsonResponse({})