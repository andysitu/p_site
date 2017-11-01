import openpyxl, xlrd
from io import BytesIO
from django.core.files.base import ContentFile
import uuid

from .models import Location, DataDate, Items, DataDate, \
    make_location

import re, datetime, time, pytz
from django.utils.timezone import activate
from django.conf import settings
from django import db

from django.utils.translation import gettext
# Used: process_excel_file

def process_excel_file(file):

    print(datetime.datetime.now())
    activate(settings.TIME_ZONE)
    filename = file.name

    file_regex = re.compile('(?P<year>\d\d\d\d)(?P<month>\d\d)'
                            + '(?P<day>\d\d)(?P<hour>\d\d)'
                            + '(?P<min>\d\d)(?P<sec>\d\d)')
    re_result = re.match(file_regex, filename)

    year = int(re_result.group("year"))
    month = int(re_result.group("month"))
    day = int(re_result.group("day"))
    hour = int(re_result.group("hour"))
    min = int(re_result.group("min"))
    sec = int(re_result.group("sec"))

    d = datetime.datetime(year=year,month=month,day=day,hour=hour,minute=min,second=sec)
    data_date_query = DataDate.objects.filter(date=d)
    if len(data_date_query) > 0:
        d_time_str =  d.strftime('%m/%d/%Y %I:%M %p')
        m_1 = gettext("Excel file with date ")
        m_2 = gettext(" has uploaded already.")
        return m1 + d_time_str + m2

    data = file.read()
    workbook = xlrd.open_workbook(file_contents=data)
    worksheet = workbook.sheet_by_index(0)

    data_date = DataDate(date=d)
    data_date.save()

    def convert_lab_id(id_string):
        return int(float(id_string))


    def get_date_from_xlrd(date_string):
        if date_string == "":
            return None
        # d = xlrd.xldate.xldate_as_datetime(date_string, workbook.datemode)
        timezone = pytz.timezone('Asia/Hong_Kong')
        print(date_string)
        year, month, day, hour, minute, second = xlrd.xldate_as_tuple(date_string, workbook.datemode)
        d = datetime.datetime(year, month, day, hour, minute, second, tzinfo=timezone)
        return d

    def cut_description_length(desc):
        return str(desc)[:100]

    column_map = {
        # Name has to mach Items model values
        (0, "item_id", int,),
        (2, "location_code", str,),
        (6, "lab_id", convert_lab_id,),
        (9, "fifo_date", get_date_from_xlrd,),
        (18, "iv_create_date", get_date_from_xlrd),
        (13, "rcv", str,),
        (27, "item_code", str,),
        (28, "ship_quantity", int,),
        (31, "item_weight", float,),
        (36, "last_out_date", get_date_from_xlrd,),
        (39, "description", cut_description_length,),
        (40, "customer_code", int,),
        (42, "avail_quantity", int,),
    }

    location_dict = {}
    item_list = []

    loc_regex = re.compile(
        '(?P<warehouse_location>.+)\.(?P<area>.+)\.(?P<aisle_letter>[a-zA-Z]*)(?P<aisle_num>\d+)\.(?P<column>.+)\.(?P<level>.+)')

    # unknown_rack_location = Location.objects.get(loc="Unknown")

    items_list = []
    for row in range(1, worksheet.nrows):
    # for row in range(1, 1000):

        item_data = {}

        # for key, col in item_map.items():
        for column_tup in column_map:
            column = column_tup[0]
            key = column_tup[1]
            modifier = column_tup[2]

            v = worksheet.cell_value(row,column)

            item_data[key] = modifier(v)

        # Add item data dictionary to location_dict
        location_code = item_data["location_code"]

        # Add item_data dictionary to item_dict
        item_code = item_data["item_code"]

        if location_code in location_dict:
            location_inst = location_dict[location_code]
        else:
            r = re.match(loc_regex, location_code)

            warehouse_location = r.group("warehouse_location")
            area = r.group("area")
            aisle_letter = r.group("aisle_letter")
            aisle_num = int(r.group("aisle_num"))
            column = int(r.group("column"))
            level = int(r.group("level"))

            # Account for human error input of items into WMS
            if area == 'F' and aisle_letter == '' and level == 1:
                aisle_letter = 'F'

            try:
                location_inst = Location.objects.get(warehouse_location=warehouse_location,
                                                     area=area,
                                                     aisle_letter=aisle_letter,
                                                     aisle_num=aisle_num,
                                                     column=column,
                                                     level=level,
                                                     )
            except Location.DoesNotExist:
                # location_inst = unknown_rack_location
                location_inst = make_location(warehouse_location=warehouse_location,
                                         area=area,
                                         aisle_letter=aisle_letter,
                                         aisle_num=aisle_num,
                                         column=column,
                                         level=level,
                                         )

            location_dict[location_code] = location_inst

        i = Items(rack_location=location_inst,
                  data_date=data_date,
                  **item_data
                  )
        # i.save()
        items_list.append(i)
    it = Items.objects.bulk_create(items_list, batch_size=2000)
    # db.reset_queries()
    print(datetime.datetime.now())
    return 0

def delete_all_rack_location():
    Location.objects.all().delete()

def reset_db(delete_rack = False):
    DataDate.objects.all().delete()

    Items.objects.all().delete()

    if delete_rack:
        delete_all_rack_location()
        # populate_rack_location()

def get_datadates(num_dates=0):
    dates = DataDate.objects.order_by('-date')
    if num_dates != 0:
        dates = dates[:num_dates]
    return dates

def get_info():
    # unknown_location = Location.objects.get(loc="Unknown")
    start = time.time()
    datadate = DataDate.objects.all().order_by('-date')[0]
    # items_query = datadate.items_set.all()
    items_query = Items.objects.filter(data_date=datadate)

    count = 0
    item_count = 0
    for i in items_query:
        count += 1
        item_count += i.avail_quantity

    print(count)
    print(time.time() - start)
    return item_count

def get_data_map(location_map, data_type):
    return []

def get_item_count_map(loc, date_id, level):
    data_dic = {}
    data_date_inst = DataDate.objects.get(pk = date_id)

    i_q = Items.objects.filter(data_date=data_date_inst, rack_location__loc=loc)
    if level != "All":
        i_q = i_q.filter(rack_location__level=level)
    i_q = i_q.select_related('rack_location')

    for item_inst in i_q:
        js_loc_code = loc_inst_to_jsloccode(item_inst.rack_location)
        if js_loc_code not in data_dic:
            data_dic[js_loc_code] = {"items": {}, "total": 0}

        location = item_inst.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        item_code = item_inst.item_code
        item_quantity = item_inst.avail_quantity + item_inst.ship_quantity
        data_dic[js_loc_code]["total"] += item_quantity

        if item_code not in cur_item_dic:
            cur_item_dic[item_code] = item_quantity
        else:
            cur_item_dic[item_code] += item_quantity

    return data_dic

def get_item_shipped_map(loc, date_1_id, date_2_id, level):
    """
    Returns dictionary map of items_shipped
    :param loc: String letter
    :param date_1_id: Int of datadate ID
    :param date_2_id: Int of datadate ID
    :param level: Int ( or "All") of level to search
    :return: {"items": {["location code"]: {item_sku[Int]: [Int # item shipped]} }, "total": 0}
    """
    data_dic = {}

    datadate_1 = DataDate.objects.get(pk = date_1_id)
    datadate_2 = DataDate.objects.get(pk = date_2_id)
    d_1 = datadate_1.date
    d_2 = datadate_2.date

    # Check whether date_1 or date_2 is older.
    if d_1 == d_2:
        return {}
    if d_1 > d_2:
        newer_datadate = datadate_1
        older_datadate = datadate_2
    else:
        newer_datadate = datadate_2
        older_datadate = datadate_1

    item_query_older = Items.objects.filter(data_date=older_datadate, rack_location__loc=loc)
    item_query_newer = Items.objects.filter(data_date=newer_datadate, fifo_date__lte=older_datadate.date).select_related('rack_location')

    if level != "All":
        item_query_older = item_query_older.filter(rack_location__level=level)
    item_query_older = item_query_older.select_related('rack_location')

    labId_newerItem_dic = {}
    labId_olderItem_dic = {}
    labId_older_iteminst_dic = {}
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

        item_code = item_inst.item_code
        item_quantity = labId_olderItem_dic[lab_id]

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
            data_dic[js_loc_code] = {"items": {}, "total": 0}

        location = item_inst.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        data_dic[js_loc_code]["total"] += difference

        if item_code not in cur_item_dic:
            cur_item_dic[item_code] = difference
        else:
            cur_item_dic[item_code] += difference

    return data_dic

def get_item_added_map(loc, date_1_id, time_period, level):
    data_dic = {}

    datadate = DataDate.objects.get(pk=date_1_id)
    submitted_date = datadate.date

    t_delta = datetime.timedelta(days=int(time_period))

    prev_date = submitted_date - t_delta

    # iv_create_date is usually the the newest date, with it being sometimes nearly the same
    #   as fifo_date.
    item_query = Items.objects.filter(data_date=datadate, rack_location__loc=loc, iv_create_date__gte=prev_date)

    if level != "All":
        item_query = item_query.filter(rack_location__level=level)
    item_query = item_query.select_related('rack_location')

    for item in item_query:
        rcv = item.rcv
        recv_re = re.compile("^RECV")

        # If RECV item
        if recv_re.match(rcv):
            if item.iv_create_date < prev_date:
                continue
        else:
            if item.fifo_date < prev_date:
                continue

        js_loc_code = loc_inst_to_jsloccode(item.rack_location)

        item_code = item.item_code
        item_quantity = item.avail_quantity + item.ship_quantity

        if js_loc_code not in data_dic:
            data_dic[js_loc_code] = {"items": {}, "total": 0}

        location = item.location_code
        if location not in data_dic[js_loc_code]["items"]:
            data_dic[js_loc_code]["items"][location] = {}
        cur_item_dic = data_dic[js_loc_code]["items"][location]

        data_dic[js_loc_code]["total"] += item_quantity

        if item_code not in cur_item_dic:
            cur_item_dic[item_code] = item_quantity
        else:
            cur_item_dic[item_code] += item_quantity

    return data_dic

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

def delete_by_date(date_id):
    data_date = DataDate.objects.get(id=date_id)
    data_date.delete()
    # It cascades to Items by foreign key association
    return data_date