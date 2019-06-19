from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.urls import reverse

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
    command = request.POST.get("command")
    if command == "create":
        payment_name = request.POST.get('payment_name')
        p = Payment(name = payment_name)
        p.save()
    elif command == "edit":
        payment_name = request.POST.get('payment_name')
        payment_id = request.POST.get("id")
        p = Payment.objects.get(id=payment_id)
        p.name = payment_name
        p.save()
    elif command == "delete":
        payment_id = request.POST.get("id")
        p = Payment.objects.get(id=payment_id)
        p.delete()

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
    command = request.POST.get('command')
    if command == "create":
        department_name = request.POST.get('department_name')
        department_location = request.POST.get("department_location")
        d = Department(name=department_name, location=department_location)
        d.save()
    elif command == "delete":
        dept_id = request.POST.get("id")
        d = Department.objects.get(id=dept_id)
        d.delete()
    elif command == "edit":
        dept_id = request.POST.get("id")
        department = request.POST.get("department")
        location = request.POST.get("location")
        
        #only implement if this was specified
        if department or location:
            d = Department.objects.get(id=dept_id)
            if department:
                d.name = department
            if location:
                d.location = location
            d.save()

    return JsonResponse({})

def create_purchase_ajax(request):
    order_number = request.POST.get("orderNumber")
    total = Decimal(request.POST.get("total"))
    purchase_date_str = request.POST.get("purchaseDate")
    payment_id = int(request.POST.get("payment"))
    vendor = request.POST.get("vendor")
    department_id = int(request.POST.get("department"))

    numItems = int(request.POST.get("numItems"))

    

    purchase_date = purchase_date_str.split("-")
    year = int(purchase_date[0])
    month = int(purchase_date[1])
    day = int(purchase_date[2])

    d = date(year=year, month=month, day=day)

    payment = Payment.objects.get(id=payment_id)
    department = Department.objects.get(id=department_id)
    
    p = Purchase()
    p.purchase_date = d
    p.order_number = order_number
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
        p.item_set.add(i)
        p.save()

    return HttpResponseRedirect(reverse('inventory_tracker:index-blank'))

def search_inv_ajax(request):
    command = request.POST.get('command')

    if command == "delete":
        id = request.POST.get("id")
        p = Purchase.objects.get(id = id)
        p.delete()

        return JsonResponse({})
    else:
        start_date = request.POST.get("start_date")
        end_date = request.POST.get("end_date")

        purchase_q = Purchase.objects.filter(purchase_date__range=[start_date, end_date])

        if request.POST.get("payment"):
            payment = request.POST.get("payment")
            purchase_q = purchase_q.filter(payment=payment)
        if request.POST.get("vendor"):
            vendor = request.POST.get("vendor")
            purchase_q = purchase_q.filter(vendor__icontains=vendor)
        if request.POST.get("department"):
            department = request.POST.get("department")
            purchase_q = purchase_q.filter(department=department)
        if request.POST.get("order_number"):
            order_number = request.POST.get("order_number")
            purchase_q = purchase_q.filter(order_number=order_number)
        if request.POST.get("total"):
            total = request.POST.get("total")
            total_modifier = request.POST.get("total_modifier")

            if total_modifier == "gte":
                purchase_q = purchase_q.filter(total__gte=total)
            elif total_modifier == "lte":
                purchase_q = purchase_q.filter(total__lte=total)
            elif total_modifier == "eq":
                purchase_q = purchase_q.filter(total=total)
        if request.POST.get("item_name"):
            item_name = request.POST.get("item_name")
            purchase_q = purchase_q.filter(item__name__icontains=item_name)
        if request.POST.get("item_type"):
            item_type = request.POST.get("item_type")
            purchase_q = purchase_q.filter(item__itemType__icontains=item_type)

        purchase_objs = {}
        for p in purchase_q:
            purchase_obj = {}
            purchase_obj["id"] = p.pk
            purchase_obj["order_number"] = p.order_number
            purchase_obj["purchase_date"] = p.purchase_date
            purchase_obj["total"] = p.total
            purchase_obj["payment"] = p.payment.name
            purchase_obj["vendor"] = p.vendor
            purchase_obj["department"] = p.department.name
            purchase_obj["location"] = p.department.location
            
            if p.invoice:
                purchase_obj["invoice"] = p.invoice.path
            purchase_obj["items"] = {}
            
            for i in p.item_set.all():
                item_obj = {}
                item_obj["name"] = i.name
                item_obj["amount"] = i.amount
                item_obj["quantity"] = i.quantity
                item_obj["note"] = i.note
                item_obj["item_type"] = i.itemType
                purchase_obj["items"][i.pk] = item_obj
            purchase_objs[p.pk] = purchase_obj
        return JsonResponse(purchase_objs)

def download_invoice_ajax(request):
    purchase_id = request.POST.get("purchase_id")
    purchase = Purchase.objects.get(id=purchase_id)
    filename = purchase.invoice.name.split('/')[-1]
    print(filename)
    response = HttpResponse(purchase.invoice, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=%s' % filename
    return response