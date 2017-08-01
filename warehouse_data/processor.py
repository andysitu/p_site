import openpyxl, xlrd
from io import BytesIO
from django.core.files.base import ContentFile

from .models import Item, RackLocation, populate_rack_location, delete_all_rack_location

import re, datetime, time

def process_excel_file(file):
    filename = file.name
    print(filename)

    file_regex = re.compile('(?P<year>20\d\d)(?P<month>[01]\d)'
                            + '(?P<day>[0123]\d)(?P<hour>[012]\d)'
                            + '(?P<min>\d\d)(?P<sec>\d\d)')
    re_result = re.match(file_regex, filename)

    year = re_result.group("year")
    month = re_result.group("month")
    day = re_result.group("day")
    hour = re_result.group("hour")
    min = re_result.group("min")
    sec = re_result.group("sec")

    print(year, month, day)

    start = time.time()
    data = file.read()
    print(time.time() - start)
    workbook = xlrd.open_workbook(file_contents=data)
    print(time.time() - start)
    worksheet = workbook.sheet_by_index(0)
    print(time.time() - start)

    item_map = {
        "id": 0,
        "location": 2,
        "inven_date": 9,
        "rcv": 13,
        "sku_name": 27,
        "ship_quantity": 28,
        "description": 29,
        "customer_code": 33,
        "quantity": 42,
    }

    col_map = {
        0: "id",
        2: "location_code",
        9: "inven_date",
        13: "rcv",
        27: "sku_name",
        28: "ship_quantity",
        39: "description",
        40: "customer_code",
        42: "quantity",
    }

    first_row = []
    for col in range(worksheet.ncols):
        first_row.append(worksheet.cell_value(0,col))

    rack_loc_query = RackLocation.objects.all()
    if len(rack_loc_query) == 0:
        populate_rack_location()

    location_dict = {}
    print(time.time() - start)
    for row in range(1, worksheet.nrows):
    # for row in range(1, 15):
        data = {}
        # for key, col in item_map.items():
        for col, key in col_map.items():
            v = worksheet.cell_value(row,col)
            if key == "inven_date":
                # print(xlrd.xldate.xldate_as_datetime(v, workbook.datemode))
                pass
            elif key == "location_code":
                loc_regex = re.compile('(?P<warehouse_location>.+)\.(?P<area>.+)\.(?P<aisle>.+)\.(?P<column>.+)\.(?P<level>.+)')
                r = re.match(loc_regex, v)
                warehouse_location = r.group("warehouse_location")
                area = r.group("area")
                aisle = r.group("aisle")
                column = r.group("column")
                level = r.group("level")

                rack_loc = RackLocation.objects.filter(warehouse_location=warehouse_location,
                                                       area=area,
                                                       aisle=aisle,
                                                       column=column,
                                                       level=level,
                                                       )
            else:
                pass
            data[key] = v
        # location_code = worksheet.cell_value(row, 2)
        # if location_code in location_dict:
        #     location_dict[location_code].append(data)
        # else:
        #     location_dict[location_code] = [data,]

    # for location_code, data_list in location_dict.items():
    #     rack_query = RackLocation.objects.filter(location_code=location_code)
    #     if len(rack_query) != 0:
    #         for data in data_list:
    #             for k, v in data.items():
    #                 pass

    end = time.time()
    print("xlrd")
    print(end - start)

    # delete_all_rack_location()
    # populate_rack_location()