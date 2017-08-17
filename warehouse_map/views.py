from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.core import serializers
from .forms import UploadExcelData
from .models import Test, GridMap

from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder
import json

from warehouse_data import processor as processor

class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, YourCustomType):
            return force_text(obj)
        return super(LazyEncoder, self).default(obj)

def test(request):
    return HttpResponse("HELLO")

def view_map(request):
    test_dic = {'fire': 'ball'}

    json_data = serializers.serialize('json', Test.objects.all(), cls=LazyEncoder)

    def add_rack_box(x, y, image_map, vertical, location_map, rack_location,):
        if vertical:
            image_map[y][x] = 'rtl'
            image_map[y][x+1] = 'rtr'
            image_map[y+1][x] = 'rl'
            image_map[y+1][x+1] = 'rr'
            image_map[y+2][x] = 'rl'
            image_map[y+2][x+1] = 'rr'
            image_map[y+3][x] = 'rbl'
            image_map[y+3][x+1] = 'rbr'

            location_map[y][x] = rack_location
            location_map[y][x + 1] = rack_location
            location_map[y + 1][x] = rack_location
            location_map[y + 1][x + 1] = rack_location
            location_map[y + 2][x] = rack_location
            location_map[y + 2][x + 1] = rack_location
            location_map[y + 3][x] = rack_location
            location_map[y + 3][x + 1] = rack_location
        else:
            image_map[y][x] = 'rtl'
            image_map[y][x+1] = 'rt'
            image_map[y][x+2] = 'rt'
            image_map[y][x+3] = 'rtr'
            image_map[y+1][x] = 'rbl'
            image_map[y+1][x+1] = 'rb'
            image_map[y+1][x+2] = 'rb'
            image_map[y+1][x+3] = 'rbr'

            location_map[y][x] = rack_location
            location_map[y][x + 1] = rack_location
            location_map[y][x + 2] = rack_location
            location_map[y][x + 3] = rack_location
            location_map[y + 1][x] = rack_location
            location_map[y + 1][x + 1] = rack_location
            location_map[y + 1][x + 2] = rack_location
            location_map[y + 1][x + 3] = rack_location

    def add_rack_aisle(x, y, image_map, vertical, location_map, location_sub, start_column, num_racks):
        for i in range(num_racks):
            if vertical:
                rack_location = location_sub + "." + str(start_column - i)
                add_rack_box(x, y + i * 4, image_map, vertical, location_map, rack_location)
            else:
                rack_location = location_sub + "." + str(start_column + i)
                add_rack_box(x + i * 4, y, image_map, vertical, location_map, rack_location)

    def make_empty_map(width, height, empty_symbol):
        # e_map = [ [empty_symbol] * width ] * height
        e_map = []
        for h in range(height):
            e_map.append([empty_symbol] * width)

        return e_map

    def create_f_map():
        f_loc_sub = "USLA.F."
        va_loc_sub = "USLA.VA."
        width = 128
        height = 112

        f_grid = GridMap(loc="F", width=width, height=height)
        f_grid.create_grids()

        f_grid.add_rack_aisle(0, 0, True, f_loc_sub + "1", 21, 7, True)
        f_grid.add_rack_aisle(0, 7*4 + 4 * 7, True, f_loc_sub + "1", 14, 14, True)

        for i in range(42):
            # For now, vertical (True) means that columns decrements
            f_grid.add_rack_aisle(3 + i*3, 0, True, f_loc_sub + str(i+2), 13, 13, True)
            f_grid.add_rack_aisle(3 + i*3, 13*4+4, True, va_loc_sub + str(i+2), 14, 14, True)

        f_grid.save()

        return {
            "image_map": f_grid.grid_image,
            "location_map": f_grid.grid_location,
        }

    def create_p_map():
        p_loc_sub = "USLA.P."
        width = 96
        height = 80

        p_grid = GridMap(loc="P", width=width, height=height)
        p_grid.create_grids()

        # Aisle 1
        p_grid.add_rack_aisle(0, 0, False, p_loc_sub + "1", 1, 2, False)
        p_grid.add_rack_aisle(16, 0, False, p_loc_sub + "1", 3, 5, False)
        p_grid.add_rack_aisle(40, 0, False, p_loc_sub + "1", 8, 5, False)
        p_grid.add_rack_aisle(64, 0, False, p_loc_sub + "1", 13, 5, False)

        for i in range(26):
            p_grid.add_rack_aisle(0, 3+i*3, False, p_loc_sub + str(i+2), 1, 12, False)
            p_grid.add_rack_aisle(52, 3+i*3, False, p_loc_sub + str(i+2), 13, 11, False)

        p_grid.save()

        return {
            "image_map": p_grid.grid_image,
            "location_map": p_grid.grid_location,
        }

    def create_s_map():
        s_loc_sub = "USLA.S."
        rack_loc_sub = "USLA.H."
        width = 90
        height = 115

        s_grid = GridMap(loc="P", width=width, height=height)
        s_grid.create_grids()

        # H RACKS
        s_grid.add_rack_aisle(0, 8, True, rack_loc_sub + "1", 18, 7, True)
        s_grid.add_rack_aisle(0, 41, True, rack_loc_sub + "1", 11, 5, True)
        s_grid.add_rack_aisle(0, 68, True, rack_loc_sub + "1", 6, 6, True)

        # S Racks Aisles 25-56
        for i in range(32):
            s_grid.add_shelf_aisle(4, 0+i*2, False, s_loc_sub + str(56 - i), 42, 18, True)
            s_grid.add_shelf_aisle(42, 0+i*2, False, s_loc_sub + str(56 - i), 24, 24, True)

        # S Racks Aisles 11 - 24
        for i in range(14):
            s_grid.add_shelf_aisle(4, 66+i*2, False, s_loc_sub + str(24 - i), 42, 18, True)
            s_grid.add_shelf_aisle(42, 66+i*2, False, s_loc_sub + str(24 - i), 24, 24, True)

        # S Racks Aisles 1 - 10
        for i in range(10):
            s_grid.add_shelf_aisle(22, 96+i*2, False, s_loc_sub + str(10 - i), 33, 9, True)
            s_grid.add_shelf_aisle(42, 96+i*2, False, s_loc_sub + str(10 - i), 24, 24, True)

        s_grid.save()

        return {
            "image_map": s_grid.grid_image,
            "location_map": s_grid.grid_location,
        }

    def create_vc_map():
        vc_loc_sub = "USLA.VC."
        rack_loc_sub = "USLA.VA."
        h_loc_sub = "USLA.H."
        width = 200
        height = 200

        vc_grid = GridMap(loc="P", width=width, height=height)
        vc_grid.create_grids()

        # VA RACKS
        vc_grid.add_rack_aisle(0, 0, False, rack_loc_sub + "44", 22, 5, True)
        # vc_grid.add_rack_aisle(0, 0, True, rack_loc_sub + "44", 17, 6, True)

        # H Racks
        for i in range(6):
            vc_grid.add_shelf_aisle(4, 0+i*2, False, s_loc_sub + str(56 - i), 42, 18, True)
            vc_grid.add_shelf_aisle(42, 0+i*2, False, s_loc_sub + str(56 - i), 24, 24, True)


        vc_grid.save()

        return {
            "image_map": vc_grid.grid_image,
            "location_map": vc_grid.grid_location,
        }

    map_dic = create_s_map()

    return render(
        request,
        'warehouse_map/map.html',
        context={
            'data_dic': json_data,
            'image_map': json.dumps(map_dic["image_map"]),
            'location_map': json.dumps(map_dic["location_map"]),

        },
    )

def upload_excel_data(request):
    if request.method == 'POST':
        upload_excel_data_form = UploadExcelData(request.POST, request.FILES)
        if upload_excel_data_form.is_valid():
            for file in request.FILES.getlist("excel_data_file"):
            # file = request.FILES["excel_data_file"]
                processor.process_excel_file(file)
    else:
        upload_excel_data_form = UploadExcelData()

    return render(
        request,
        'warehouse_map/upload_excel_data.html',
        context={
            "upload_form": upload_excel_data_form,
        }
    )

def reset_db(request):
    processor.reset_db()
    return redirect("warehouse_map:index")

def reset_db_true(request):
    processor.reset_db(delete_rack=True)
    return redirect("warehouse_map:index")

def compare_dates(request):
    date_list = processor.get_dates()

    return render(
        request,
        "warehouse_map/compare.html",
        context = {
            "date_list": date_list,
        }
    )

def get_info(request):
    d = processor.get_info()

    return render(
        request,
        "warehouse_map/warehouse_info.html",
        context={
            "data_date": d,
        }
    )

def test_map(request):
    return render(
        request,
        'warehouse_map/test_map.html',
        context={

        }
    )