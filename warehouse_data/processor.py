import openpyxl, xlrd
from io import BytesIO
from django.core.files.base import ContentFile
import uuid

from .models import Item, RackLocation, DataDate, \
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

    column_map = {
        (0, "id", convert_id,),
        (2, "location_code", str,),
        (9, "inven_date", None,),
        (13, "rcv", str,),
        (27, "sku_name", str,),
        (28, "ship_quantity", int,),
        (39, "description", str,),
        (40, "customer_code", int,),
        (42, "quantity", int,),
        # 0: "id",
        # 2: "location_code",
        # 9: "inven_date",
        # 13: "rcv",
        # 27: "sku_name",
        # 28: "ship_quantity",
        # 39: "description",
        # 40: "customer_code",
        # 42: "quantity",
    }

    first_row = []
    for col in range(worksheet.ncols):
        first_row.append(worksheet.cell_value(0,col))

    rack_loc_query = RackLocation.objects.all()
    if len(rack_loc_query) == 0:
        populate_rack_location()

    location_dict = {}
    print(time.time() - start)
    # for row in range(1, worksheet.nrows):
    for row in range(1, 30):
        data = {}
        data["data_date"] = data_date

        location_code = None
        # for key, col in item_map.items():
        for column_tup in column_map:
            column = column_tup[0]
            key = column_tup[1]
            modifier = column_tup[2]

            v = worksheet.cell_value(row,column)
            print(key, v)

            if key == "inven_date":
                d = xlrd.xldate.xldate_as_datetime(v, workbook.datemode)
                data[key] = d
            else:
                data[key] = modifier(v)

            print(data[key])

        location_code = data["location_code"]

        if location_code in location_dict:
            location_dict[location_code].append(data)
        else:
            location_dict[location_code] = [data,]

    for location_code, data_list in location_dict.items():
        loc_regex = re.compile('(?P<warehouse_location>.+)\.(?P<area>.+)\.(?P<aisle>.+)\.(?P<column>.+)\.(?P<level>.+)')
        r = re.match(loc_regex, location_code)
        warehouse_location = r.group("warehouse_location")
        area = r.group("area")
        aisle = r.group("aisle")
        column = r.group("column")
        level = r.group("level")

        rack_query = RackLocation.objects.filter(warehouse_location=warehouse_location,
                                               area=area,
                                               aisle=aisle,
                                               column=column,
                                               level=level,
                                               )

        rack_location = rack_query[0]
        if len(rack_query) != 0:
            for data in data_list:
                i = Item(rack_location=rack_location, **data)
                i.save()

    end = time.time()
    print("xlrd")
    print(end - start)

    # delete_all_rack_location()
    # populate_rack_location()