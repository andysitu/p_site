from django.shortcuts import render
from django.core import serializers

from django.http import HttpResponse, JsonResponse

from .models import DataDate, Items, Location
from .helper_functions import get_all_location_dic

from django.db import IntegrityError

import operator

elements_dictionary = {
    "multiple_dates": "dates",
    "multiple_locs": "locs",
}

def loc_inst_to_jsloccode(loc_inst):
    # Returns the loc_code used in js component
    #   (Location code, without the level implemented).
    warehouse_code = "USLA"
    area_code = ""
    aisle_code = str(loc_inst.aisle_num)
    column_code = str(loc_inst.column)

    loc = loc_inst.loc
    area = loc_inst.area
    aisle_letter = loc_inst.aisle_letter
    if loc == "P":
        area_code = "P"
    elif loc == "S":
        if area == "H" and aisle_letter == "H" or area == "S":
            area_code = "S"
        else:
            area_code = "H"
    elif loc == "VC":
        if area == "VC" or area == "VD":
            area_code = "VC"
        elif area == "VA" or area == "VB":
            area_code = "VA"
        else:
            area_code = "H"
    else:
        if area == "F":
            area_code = "F"
        else:
            area_code = "VA"
    return warehouse_code + "." + area_code + "." + aisle_code + "." + column_code

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

def get_item_count(request):
    data_dic = {}

    date_id = request.GET.get("date-1")
    loc = request.GET.get("loc")


    data_date_inst = DataDate.objects.get(pk=date_id)

    i_q = Items.objects.filter(data_date=data_date_inst, rack_location__loc=loc)
    i_q = i_q.select_related('rack_location')

    for item_inst in i_q:
        js_loc_code = loc_inst_to_jsloccode(item_inst.rack_location)
        if js_loc_code not in data_dic:
            data_dic[js_loc_code] = {"items": {}}

        location = item_inst.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        item_code = item_inst.item_code
        item_quantity = item_inst.avail_quantity + item_inst.ship_quantity

        if item_code not in cur_item_dic:
            cur_item_dic[item_code] = item_quantity
        else:
            cur_item_dic[item_code] += item_quantity

    return data_dic

def get_normal_item_query(data_date):
    return Items.objects.select_related('rack_location').filter(data_date=data_date, ).exclude(rack_location__loc="").exclude(customer_code=900135)

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
    item_query = get_normal_item_query(data_date).iterator()
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

def get_added_items_over_time(request):
    data = {}

    date_ids = request.GET.getlist(elements_dictionary["multiple_dates"] + "[]")
    locs = request.GET.getlist(elements_dictionary["multiple_locs"] + "[]")

    if len(locs) == 0:
        locs = ["All", ]

    if "All" in locs:
        all_status = True
    else:
        all_status = False

    for i in range(len(locs)):
        loc = locs[i]
        data[loc] = {}

    for date_id in date_ids:
        data_date = DataDate.objects.get(id=date_id)
        date_str = data_date.date.timestamp() * 1000
        for loc in data:
            data[loc][date_str] = 0

        item_query = get_normal_item_query(data_date)
        item_query = item_query.iterator()
        for item in item_query:
            item_loc = item.rack_location.loc
            total_items = item.avail_quantity + item.ship_quantity
            if all_status:
                data["All"][date_str] += total_items
            if item_loc in data:
                data[item_loc][date_str] += total_items
    return data

def number_items_over_time(request):
    data = {}

    date_ids = request.GET.getlist(elements_dictionary["multiple_dates"] + "[]")
    locs = request.GET.getlist(elements_dictionary["multiple_locs"] + "[]")

    if len(locs) == 0:
        locs = ["All",]

    if "All" in locs:
        all_status = True
    else:
        all_status = False

    for i in range(len(locs)):
        loc = locs[i]
        data[loc] = {}

    for date_id in date_ids:
        data_date = DataDate.objects.get(id=date_id)
        date_str = data_date.date.timestamp() * 1000
        for loc in data:
            data[loc][date_str] = 0

        item_query = get_normal_item_query(data_date)
        item_query = item_query.iterator()
        for item in item_query:
            item_loc = item.rack_location.loc
            total_items = item.avail_quantity + item.ship_quantity
            if all_status:
                data["All"][date_str] += total_items
            if item_loc in data:
                data[item_loc][date_str] += total_items
    return data

def item_type_filter(request):
    # Counts the avail_quantity in each item
    date_id = request.GET.get("date-1")
    data_date = DataDate.objects.get(id=date_id)

    num_item_types = int(request.GET.get("num-item-types"))
    num_item_type_modifier = request.GET.get("num-item-type-modifier")

    loc = request.GET.get("loc")

    data = {}
    items_q = get_normal_item_query(data_date).filter(rack_location__loc=loc).iterator()

    # locations = sorted(items_in_locations.items(), key=operator.itemgetter(1))[::-1]
    locations_dic = get_all_location_dic(loc)

    for item in items_q:
        avail_quantity = item.avail_quantity
        if avail_quantity <= 0:
            continue

        location_inst = item.rack_location

        area = location_inst.area
        aisle_letter = location_inst.aisle_letter
        aisle_num = location_inst.aisle_num
        level = location_inst.level
        column = location_inst.column

        item_code = item.item_code


        # Set Area
        if area == "H" and aisle_letter == "H":
            area = "S"
        elif area == "PH" or area == "PA":
            area = "P"
        elif area == "VD":
            area = "VC"
        elif area == "VB":
            area = "VA"

        location_code = "USLA." + area + "." + str(aisle_num) + "." + str(column) + "." + str(level)
        loc_dic = locations_dic[location_code]

        if item_code not in loc_dic:
            loc_dic[item_code] = avail_quantity
        else:
            loc_dic[item_code] += avail_quantity

    data["item-type-filter_unfiltered"] = locations_dic
    return data

