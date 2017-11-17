from django.shortcuts import render
from django.core import serializers

from django.http import HttpResponse, JsonResponse

from .models import DataDate, Items, Location

from django.db import IntegrityError

import operator

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

def separate_list_of_tupe(sorted_list):
    """
    Takes in a sorted lists of tuples of length 2
    :return: a lists of two lists of the separated tuple of length 2
    """
    sorted_list_len = len(sorted_list)
    list_a = []
    list_b = []
    for i in range(sorted_list_len):
        list_tup = sorted_list[i]
        list_a.append(list_tup[0])
        list_a.append(list_tup[1])
    return [list_a, list_b]

def get_total_item_info(request, num_top=20):
    date_id = request.GET.get("date-1")
    data_date = DataDate.objects.get(id=date_id)

    info_dic = {}
    customers_item_dic = {}
    customers_num = 0

    item_count = {}
    loc_item_count = {}
    loc_item_type = {}

    customers_item_count = {}
    customers_type_count = {}
    total = 0
    item_types = 0
    item_query = Items.objects.select_related('rack_location').filter(data_date=data_date, ).exclude(rack_location__loc="").iterator()
    for item in item_query:
        total_items = item.avail_quantity + item.ship_quantity
        total += total_items
        sku = item.item_code
        customer_code = item.customer_code

        loc = item.rack_location.loc

        if customer_code not in customers_item_dic:
            customers_item_dic[customer_code] = {}
            customers_item_count[customer_code] = 0
            customers_type_count[customer_code] = 0
            customers_num += 1

        customers_item_count[customer_code] += total_items

        customer_dic = customers_item_dic[customer_code]
        if sku not in customer_dic:
            item_count[sku] = total_items
            customer_dic[sku] = total_items
            customers_type_count[customer_code] += 1
            item_types += 1

            if loc not in loc_item_type:
                loc_item_type[loc] = 1
            else:
                loc_item_type[loc] += 1
        else:
            item_count[sku] += total_items
            customer_dic[sku] += total_items

        if loc not in loc_item_count:
            loc_item_count[loc] = total_items
        else:
            loc_item_count[loc] += total_items

    top_customers_items = sorted(customers_item_count.items(), key=operator.itemgetter(1))[::-1][:num_top:]
    top_customers_item_type = sorted(customers_type_count.items(), key=operator.itemgetter(1))[::-1][:num_top:]
    top_item_count = sorted(item_count.items(), key=operator.itemgetter(1))[::-1][:num_top:]
    top_loc_count = sorted(loc_item_count.items(), key=operator.itemgetter(1))[::-1][:num_top:]
    top_loc_item_type = sorted(loc_item_type.items(), key=operator.itemgetter(1))[::-1][:num_top:]

    info_dic["item-total"] = total
    info_dic["number-item-types"] = item_types
    info_dic["number-of-customers"] = customers_num

    info_dic["top-customers-by-items"] = top_customers_items
    info_dic["top-customers-by-item-type"] = top_customers_item_type
    info_dic["top-item-count"] = top_item_count
    info_dic["item-count-by-loc"] = top_loc_count
    info_dic["item-type-by-loc"] = top_loc_item_type

    return info_dic

def get_locations(request):
    date_id = request.GET.get("date-1")
    data_date = DataDate.objects.get(id=date_id)

    data = {}
    items_in_locations = {}

    items_q = Items.objects.select_related("rack_location").filter(data_date=data_date).exclude(rack_location__loc="").iterator()

    for item in items_q:
        location = str(item.rack_location)
        if location in items_in_locations:
            item_code = item.item_code
            item_arr = items_in_locations[location]
            if item_code not in item_arr:
                item_arr[item_code] = "A"
        else:
            items_in_locations[location] = {item.item_code: "A",}

    # locations = sorted(items_in_locations.items(), key=operator.itemgetter(1))[::-1]
    # data["locations"] = locations

    return items_in_locations