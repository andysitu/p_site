import openpyxl, xlrd
from io import BytesIO
from django.core.files.base import ContentFile
import uuid

from .models import Location, DataDate, ItemInfo, Items,\
    populate_rack_location, delete_all_rack_location

import re, datetime, time, pytz

def process_excel_file(file):
    filename = file.name
    print(filename)

    file_regex = re.compile('(?P<year>20\d\d)(?P<month>[01]\d)'
                            + '(?P<day>[0123]\d)(?P<hour>[012]\d)'
                            + '(?P<min>\d\d)(?P<sec>\d\d)')
    re_result = re.match(file_regex, filename)

    year = int(re_result.group("year"))
    month = int(re_result.group("month"))
    day = int(re_result.group("day"))
    hour = int(re_result.group("hour"))
    min = int(re_result.group("min"))
    sec = int(re_result.group("sec"))

    timezone = pytz.timezone('America/Los_Angeles')

    d = datetime.datetime(year=year,month=month,day=day,hour=hour,minute=min,second=sec, tzinfo=timezone)
    data_date_query = DataDate.objects.filter(date=d)
    if len(data_date_query) > 0:
        d_time_str =  d.strftime('%m/%d/%Y %I:%M %p')
        return "Excel filew with date " + d_time_str + " has been used before."

    data_date = DataDate(date=d)
    data_date.save()

    start = time.time()
    data = file.read()
    print(time.time() - start)
    workbook = xlrd.open_workbook(file_contents=data)
    print(time.time() - start)
    worksheet = workbook.sheet_by_index(0)
    print(time.time() - start)

    def convert_id(id_value):
        value = int(id_value)
        return uuid.UUID(int=value)

    def get_date_from_xlrd(date_string):
        # d = xlrd.xldate.xldate_as_datetime(date_string, workbook.datemode)
        timezone = pytz.timezone('Asia/Hong_Kong')
        year, month, day, hour, minute, second = xlrd.xldate_as_tuple(date_string, workbook.datemode)
        d = datetime.datetime(year, month, day, hour, minute, second, tzinfo=timezone)
        return d

    def cut_description_length(desc):
        return str(desc)[:100]

    column_map = {
        (0, "item_id", int,),
        (2, "location_code", str,),
        (9, "fifo_date", get_date_from_xlrd,),
        (18, "iv_create_date", get_date_from_xlrd),
        (13, "rcv", str,),
        (27, "sku_name", str,),
        (28, "ship_quantity", int,),
        (39, "description", cut_description_length,),
        (40, "customer_code", int,),
        (42, "avail_quantity", int,),
    }

    first_row = []
    for col in range(worksheet.ncols):
        first_row.append(worksheet.cell_value(0,col))

    rack_loc_query = Location.objects.all()
    if not rack_loc_query:
        populate_rack_location()

    location_dict = {}
    item_dict = {}
    print(time.time() - start)
    for row in range(1, worksheet.nrows):
    # for row in range(1, 30):
        item_data = {}

        location_code = None
        # for key, col in item_map.items():
        for column_tup in column_map:
            column = column_tup[0]
            key = column_tup[1]
            modifier = column_tup[2]

            v = worksheet.cell_value(row,column)

            item_data[key] = modifier(v)

        location_code = item_data["location_code"]

        if location_code in location_dict:
            location_dict[location_code].append(item_data)
        else:
            location_dict[location_code] = [item_data,]


    for location_code, data_list in location_dict.items():
        loc_regex = re.compile('(?P<warehouse_location>.+)\.(?P<area>.+)\.(?P<aisle_letter>[a-zA-Z]*)(?P<aisle_num>\d+)\.(?P<column>.+)\.(?P<level>.+)')
        r = re.match(loc_regex, location_code)
        if r == None:
            break
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
            rack_location = Location.objects.get(warehouse_location=warehouse_location,
                                                area=area,
                                                aisle_letter=aisle_letter,
                                                aisle_num=aisle_num,
                                                column=column,
                                                level=level,
                                            )
        except Location.DoesNotExist:
            rack_location = Location.objects.get(loc="Unknown")
        # for i_data in data_list:
        #     i = Item(data_date=data_date, rack_location=rack_location, **i_data)
        #     i.save()

    end = time.time()
    print(end - start)

    return 0

def reset_db():
    data_date_query = DataDate.objects.all()
    for d in data_date_query:
        d.delete()

    # item_query = Item.objects.all()
    # for i in item_query:
    #     i.delete()

    delete_all_rack_location()
    populate_rack_location()