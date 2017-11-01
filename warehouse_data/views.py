from django.shortcuts import render
from django.core import serializers

from django.http import HttpResponse, JsonResponse

from .models import DataDate, Items

def get_dates(request):
    num_dates = int(request.GET.get("num_dates"))
    dates = DataDate.objects.order_by('-date')
    # if num_dates != 0:
    #     dates = dates[:num_dates]

    date_list = []

    for data_date_inst in dates:
        date_id = data_date_inst.id
        date_str = data_date_inst.date.astimezone().strftime("%m/%d/%y-%I:%M%p")

        date_list.append({"date_id":date_id, "date_string": date_str,})
    return JsonResponse(date_list, safe=False)

def total_item_count(request):
    quantity =0
    date_id = request.GET.get("date-1")
    data_date = DataDate.objects.get(id=date_id)
    item_query = Items.objects.filter(data_date=data_date,).exclude(rack_location__loc="").iterator()

    for item in item_query:
        quantity += item.avail_quantity + item.ship_quantity

    return HttpResponse(quantity)