from django.shortcuts import render
from django.core import serializers

from django.http import HttpResponse, JsonResponse

from .models import DataDate, Items, Location
from .helper_functions import get_all_location_dic

import datetime, re
from django.db import IntegrityError

import operator

elements_dictionary = {
    "single_date": "date",
    "multiple_dates": "dates",
    "multiple_locs": "locs",
    "time_period": "time-period",
    "filter_value": "filter_value",
    "filter_option": "filter_option",
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

def make_item_name_for_map(item_inst):
    item_code = item_inst.item_code
    customer_code = item_inst.customer_code
    item_quantity = item_inst.avail_quantity + item_inst.ship_quantity
    return str(customer_code) + "-" + item_code


def get_item_count(request):
    """
    Gets item_count of a specific location
    :param request: request [ date_id[int] & loc [String] ]
    :return: data_dic
        {
            location Code [string]: {
                "items": {
                    item_sku [string]: item_count [ int]
                }
            }
        }
    """
    data_dic = {}

    date_id = request.GET.get("date-1")
    loc = request.GET.get("loc")
    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

    data_date_inst = DataDate.objects.get(pk=date_id)

    i_q = get_normal_item_query(data_date_inst, filter_option, filter_value).filter(rack_location__loc=loc)

    for item_inst in i_q:
        js_loc_code = loc_inst_to_jsloccode(item_inst.rack_location)
        if js_loc_code not in data_dic:
            data_dic[js_loc_code] = {"items": {}}

        location = item_inst.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        item_name = make_item_name_for_map(item_inst)
        item_quantity = item_inst.avail_quantity + item_inst.ship_quantity

        if item_name not in cur_item_dic:
            cur_item_dic[item_name] = item_quantity
        else:
            cur_item_dic[item_name] += item_quantity

    return data_dic

def get_item_weight(request):
    """
    Gets item_weight of a specific location
    :param request: request [ date_id[int] & loc [String] ]
    :return: data_dic
        {
            location Code [string]: {
                "items": {
                    item_sku [string]: item_count [ int]
                }
            }
        }
    """
    data_dic = {}

    date_id = request.GET.get("date-1")
    loc = request.GET.get("loc")
    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

    data_date_inst = DataDate.objects.get(pk=date_id)

    i_q = get_normal_item_query(data_date_inst, filter_option, filter_value).filter(rack_location__loc=loc)

    for item_inst in i_q:
        js_loc_code = loc_inst_to_jsloccode(item_inst.rack_location)
        if js_loc_code not in data_dic:
            data_dic[js_loc_code] = {"items": {}}

        location = item_inst.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        item_weight = item_inst.item_weight
        item_quantity = item_inst.avail_quantity + item_inst.ship_quantity
        item_name = make_item_name_for_map(item_inst)

        if item_name not in cur_item_dic:
            cur_item_dic[item_name] = item_quantity * item_weight
        else:
            cur_item_dic[item_name] += item_quantity * item_weight

    return data_dic

def get_item_added(request):
    """
    Gets items_added of a specific location
    :param request: request [ date_id[int] & loc [String] ]
    :return: data_dic
        {
            location Code [string]: {
                "items": {
                    item_sku [string]: item_count [ int]
                }
            }
        }
    """
    data_dic = {}

    date_id = request.GET.get("date-1")
    loc = request.GET.get("loc")
    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

    data_date_inst = DataDate.objects.get(pk=date_id)

    time_period = request.GET.get(elements_dictionary["time_period"])

    t_delta = datetime.timedelta(days=int(time_period))


    if data_date_inst.date.weekday() == 0:
        monday_t_delta = datetime.timedelta(days=int(time_period) + 1)
        prev_date = data_date_inst.date - monday_t_delta
    else:
        prev_date = data_date_inst.date - t_delta

    i_q = get_normal_item_query(data_date_inst, filter_option, filter_value).filter(rack_location__loc=loc)

    for item_inst in i_q:
        rcv = item_inst.rcv
        recv_re = re.compile("^RECV")

        # If RECV item
        if recv_re.match(rcv):
            if item_inst.iv_create_date < prev_date:
                continue
        else:
            if item_inst.fifo_date < prev_date:
                continue

        js_loc_code = loc_inst_to_jsloccode(item_inst.rack_location)
        if js_loc_code not in data_dic:
            data_dic[js_loc_code] = {"items": {}}

        location = item_inst.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        item_quantity = item_inst.avail_quantity + item_inst.ship_quantity
        item_name = make_item_name_for_map(item_inst)

        if item_name not in cur_item_dic:
            cur_item_dic[item_name] = item_quantity
        else:
            cur_item_dic[item_name] += item_quantity

    return data_dic

def get_item_shipped(request):
    """
    Gets shipped of a specific location
    :param request: request [ date_id[int] & loc [String] ]
    :return: data_dic
        {
            location Code [string]: {
                "items": {
                    item_sku [string]: item_count [ int]
                }
            }
        }
    """
    data_dic = {}

    loc = request.GET.get("loc")

    date_1_id = request.GET.get("date-1")
    data_date_1 = DataDate.objects.get(pk=date_1_id)
    date_1 = data_date_1.date

    date_2_id = request.GET.get("date-2")
    data_date_2 = DataDate.objects.get(pk=date_2_id)
    date_2 = data_date_2.date

    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

    # Check whether date_1 or date_2 is older.
    if date_1 == date_2:
        return {}
    if date_1 > date_2:
        newer_datadate = data_date_1
        older_datadate = data_date_2
    else:
        newer_datadate = data_date_2
        older_datadate = data_date_1

    item_query_older = get_normal_item_query(older_datadate, filter_option, filter_value).filter(rack_location__loc=loc).iterator()
    item_query_newer = get_normal_item_query(newer_datadate, filter_option, filter_value).filter(fifo_date__lte=older_datadate.date).iterator()

    labId_newerItem_dic = {}
    labId_olderItem_dic = {}
    labId_older_iteminst_dic = {}

    # lab_id is kept constant among items even when separated (such as when
    #   items in one location is split into two locations.
    for item_1 in item_query_newer:
        lid = item_1.lab_id
        if lid in labId_newerItem_dic:
            labId_newerItem_dic[lid] += item_1.avail_quantity + item_1.ship_quantity
        else:
            labId_newerItem_dic[lid] = item_1.avail_quantity + item_1.ship_quantity

    for item_2 in item_query_older:
        lid = item_2.lab_id
        if lid in labId_olderItem_dic:
            labId_olderItem_dic[lid] += item_2.avail_quantity + item_2.ship_quantity
        else:
            labId_olderItem_dic[lid] = item_2.avail_quantity + item_2.ship_quantity
        # New items in excel are read first, so older items will replace older
        #   ones in lab_id_loc_dic. Because older items should go first
        #   (It's actually by RCV date).

        labId_older_iteminst_dic[lid] = item_2

    for lab_id in labId_olderItem_dic:
        item_inst = labId_older_iteminst_dic[lab_id]

        js_loc_code = loc_inst_to_jsloccode(item_inst.rack_location)

        item_quantity = labId_olderItem_dic[lab_id]
        item_name = make_item_name_for_map(item_inst)

        if lab_id in labId_newerItem_dic:
            difference = item_quantity - labId_newerItem_dic[lab_id]
        else:
            difference = item_quantity
        if difference == 0:
            continue
        elif difference < 0:
            item_q = Items.objects.filter(data_date=older_datadate, lab_id=lab_id)
            total = 0
            for i in item_q:
                total += i.avail_quantity + i.ship_quantity
                difference = total - labId_newerItem_dic[lab_id]
            if difference == 0:
                continue

        if js_loc_code not in data_dic:
            data_dic[js_loc_code] = {"items": {}}

        location = item_inst.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        if item_name not in cur_item_dic:
            cur_item_dic[item_name] = difference
        else:
            cur_item_dic[item_name] += difference

    return data_dic

def get_normal_item_query(data_date, filter_option=None, filter_value=None):
    query = Items.objects.select_related('rack_location').filter(data_date=data_date, )
    if filter_value:
        if filter_option == "customer_code":
            customer = int(filter_value)
            query = query.filter(customer_code=customer)
        elif filter_option == "item_code":
            query = query.filter(item_code=filter_value)
        elif filter_option == "rcv":
            query = query.filter(rcv=filter_value)
    return query.exclude(rack_location__loc="").exclude(customer_code=900135)


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

def search(request):
    data = {}

    date_id = request.GET.get(elements_dictionary["single_date"])
    locs = request.GET.getlist(elements_dictionary["multiple_locs"] + "[]")

    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

    if len(locs) == 0:
        locs = ["All", ]

    if "All" in locs:
        all_status = True
    else:
        all_status = False

    data_date = DataDate.objects.get(id=date_id)

    date_str = data_date.date.timestamp() * 1000
#
    item_query = get_normal_item_query(data_date, filter_option, filter_value)
    item_query = item_query.iterator()
    for item in item_query:
        item_loc = str(item.rack_location)
        rcv = item.rcv
        item_code = item.item_code
        description = item.description
        avail_quantity = item.avail_quantity
        ship_quantity = item.ship_quantity



        total_items = item.avail_quantity + item.ship_quantity

        # if all_status:
        #     data["All"][date_str] += total_items
        # if item_loc in data:
        #     data[item_loc][date_str] += total_items
        if item_code not in data:
            data[item_code] = {}
        d = data[item_code]
        if item_loc not in d:
            d[item_loc] = {
                "avail_quantity" : avail_quantity,
                "ship_quantity": ship_quantity,
                "description": description,
                "item_code": item_code,
                "rcv": rcv,
                "location": item_loc,
            }
        else:
            d[item_loc]["avail_quantity"] += avail_quantity
            d[item_loc]["ship_quantity"] += ship_quantity
    return data

def get_added_items_over_time(request):
    data = {}

    time_period = request.GET.get(elements_dictionary["time_period"])
    date_ids = request.GET.getlist(elements_dictionary["multiple_dates"] + "[]")
    locs = request.GET.getlist(elements_dictionary["multiple_locs"] + "[]")

    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

    t_delta = datetime.timedelta(days=int(time_period))

    monday_t_delta = datetime.timedelta(days=int(time_period) + 1)

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

        if data_date.date.weekday() == 0:
            prev_date = data_date.date - monday_t_delta
        else:
            prev_date = data_date.date - t_delta

        date_str = data_date.date.timestamp() * 1000
        for loc in data:
            data[loc][date_str] = 0

        item_query = get_normal_item_query(data_date, filter_option, filter_value)
        item_query = item_query.filter(iv_create_date__gte=prev_date)
        item_query = item_query.iterator()
        for item in item_query:
            item_loc = item.rack_location.loc
            rcv = item.rcv
            recv_re = re.compile("^RECV")

            if recv_re.match(rcv):
                if item.iv_create_date < prev_date:
                    continue
            else:
                if item.fifo_date < prev_date:
                    continue

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

    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

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

        item_query = get_normal_item_query(data_date, filter_option, filter_value)
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

def item_type_over_time(request):
    item_sku_dic = {}
    data = {}

    date_ids = request.GET.getlist(elements_dictionary["multiple_dates"] + "[]")
    locs = request.GET.getlist(elements_dictionary["multiple_locs"] + "[]")
    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

    if len(locs) == 0:
        locs = ["All", ]

    if "All" in locs:
        all_status = True
    else:
        all_status = False

    for i in range(len(locs)):
        loc = locs[i]
        item_sku_dic[loc] = {}
        data[loc] = {}

    for date_id in date_ids:
        data_date = DataDate.objects.get(id=date_id)
        date_str = data_date.date.timestamp() * 1000
        for loc in data:
            item_sku_dic[loc][date_str] = {}
            data[loc][date_str] = 0

        item_query = get_normal_item_query(data_date, filter_option, filter_value)
        item_query = item_query.iterator()
        for item in item_query:
            item_loc = item.rack_location.loc
            item_sku = item.item_code
            if all_status:
                item_sku_dic["All"][date_str][item_sku] = True
            if item_loc in data:
                item_sku_dic[item_loc][date_str][item_sku] = True

    for loc in item_sku_dic:
        for date_str in item_sku_dic[loc]:
            data[loc][date_str] = len(item_sku_dic[loc][date_str])

    return data

def num_customers_over_time(request):
    item_sku_dic = {}
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
        item_sku_dic[loc] = {}
        data[loc] = {}

    for date_id in date_ids:
        data_date = DataDate.objects.get(id=date_id)
        date_str = data_date.date.timestamp() * 1000
        for loc in data:
            item_sku_dic[loc][date_str] = {}
            data[loc][date_str] = 0

        item_query = get_normal_item_query(data_date)
        item_query = item_query.iterator()
        for item in item_query:
            item_loc = item.rack_location.loc
            customer_code = item.customer_code
            if all_status:
                item_sku_dic["All"][date_str][customer_code] = True
            if item_loc in data:
                item_sku_dic[item_loc][date_str][customer_code] = True

    for loc in item_sku_dic:
        for date_str in item_sku_dic[loc]:
            data[loc][date_str] = len(item_sku_dic[loc][date_str])

    return data

def items_shipped_over_time(request):
    data = {}

    date_ids = request.GET.getlist(elements_dictionary["multiple_dates"] + "[]")
    locs = request.GET.getlist(elements_dictionary["multiple_locs"] + "[]")

    filter_value = request.GET.get(elements_dictionary["filter_value"])
    filter_option = request.GET.get(elements_dictionary["filter_option"])

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

        item_query = get_normal_item_query(data_date, filter_option, filter_value)
        item_query = item_query.iterator()
        for item in item_query:
            item_loc = item.rack_location.loc
            total_items = item.ship_quantity
            if all_status:
                data["All"][date_str] += total_items
            if item_loc in data:
                data[item_loc][date_str] += total_items
    return data