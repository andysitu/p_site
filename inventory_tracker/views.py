from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .models import *

from decimal import Decimal
from datetime import date
from .forms import UploadFileForm

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

def create_item_ajax(request):
    order_num = request.POST.get("orderNum")
    total = Decimal(request.POST.get("total"))
    purchase_date_str = request.POST.get("purchaseDate")
    payment_id = int(request.POST.get("payment"))
    vendor_id = int(request.POST.get("vendor"))
    department_id = int(request.POST.get("department"))

    numItems = int(request.POST.get("numItems"))

    

    purchase_date = purchase_date_str.split("-")
    year = int(purchase_date[0])
    month = int(purchase_date[1])
    day = int(purchase_date[2])

    d = date(year=year, month=month, day=day)

    payment = Payment.objects.get(id=payment_id)
    vendor = Vendor.objects.get(id=vendor_id)
    department = Department.objects.get(id=department_id)
    
    p = Purchase()
    p.purchase_date = d
    p.order_num = order_num
    p.total = total
    p.vendor = vendor
    p.department = department
    p.payment = payment
    if (request.FILES.get("invoiceFile", False)):
        p.invoice = request.FILES["invoiceFile"]
    p.save()
    
    for x in range(1, numItems+1):
        item_name = request.POST.get("itemName-" + str(x))
        amount = Decimal(request.POST.get("itemAmount-" + str(x)))
        quantity = int(request.POST.get("itemQuantity-" + str(x)))
        item_type = request.POST.get("itemType-" + str(x))
        item_note = request.POST.get("itemNote-" + str(x))

        i = Item(name=item_name, amount = amount, 
            quantity=quantity, note = item_note, itemType=item_type)
        i.save()
        print(i.pk)
        i_id = i.pk
        p.items.add(i_id)
        p.save()
    

    return create_inv(request)