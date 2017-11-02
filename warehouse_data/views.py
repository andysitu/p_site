from django.shortcuts import render
from django.core import serializers

from django.http import HttpResponse, JsonResponse

from .models import DataDate, Items, Total_Item_Info
from django.db import IntegrityError

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

def get_total_item_info(request):
    def get_total_item_dic(data_date):
        item_dic = {}
        info_dic = {}
        customers = {}
        total = 0
        item_query = Items.objects.filter(data_date=data_date, ).exclude(rack_location__loc="").iterator()
        for item in item_query:
            total += item.avail_quantity + item.ship_quantity
            # sku = item.item_code
            # customer_code = item.customer_code
            #
            # if customer_code in customers:
            #     customer_dic = customers[customer_code]
            #     if sku in customer_dic:
            #
            #     else:
            #         pass
            # else:
            #     customers[customer_code] = {}
            # customers[customer_code][sku] += total

        info_dic["total"] = total
        return info_dic

    date_id = request.GET.get("date-1")
    data_date = DataDate.objects.get(id=date_id)

    try:
        total_item_inst = Total_Item_Info.objects.get(data_date=data_date)
        if not total_item_inst.check_version():
            total_item_inst.delete()
            raise Total_Item_Info.DoesNotExist
    except (Total_Item_Info.DoesNotExist, IntegrityError) as e:
        total_items_dic = get_total_item_dic(data_date)
        total_item_inst = Total_Item_Info(data_date=data_date, **total_items_dic)
        total_item_inst.save()

    item_info = {"total": total_item_inst.total}

    return JsonResponse(item_info)