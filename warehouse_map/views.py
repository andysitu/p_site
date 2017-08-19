from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from .forms import UploadExcelData, XMLRequestGridForm
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

def combine_all_grid_maps(request):
    s_grid_map_dic = get_grid_map(loc='S')
    p_grid_map_dic = get_grid_map(loc='P')
    f_grid_map_dic = get_grid_map(loc='F')
    vc_grid_map_dic = get_grid_map(loc='VC')
    grid_arr = [
        f_grid_map_dic,
        vc_grid_map_dic,
        s_grid_map_dic,
        p_grid_map_dic,
    ]
    return combine_grid_maps(grid_arr)

def combine_grid_maps(grid_arr):
    max_length = 0

    for grid_dic in grid_arr:
        g_len = len(grid_dic["image_map"])
        if g_len > max_length:
            max_length = g_len

    new_image_map = [ [] ] * max_length
    new_location_map = [ [] ] * max_length

    for grid_dic in grid_arr:
        i_map = grid_dic["image_map"]
        loc_map = grid_dic["location_map"]

        x_length = len(i_map[0])

        cur_map_len = len(i_map)
        for i in range(max_length):
            if i < cur_map_len:
                new_image_map[i] = new_image_map[i] + i_map[i]
                new_location_map[i] = new_location_map[i] + loc_map[i]
            else:
                new_image_map[i] += [ GridMap.empty_image_letter ] * x_length
                new_location_map[i] += [ GridMap.empty_location_letter ] * x_length
    return {
        "image_map": new_image_map,
        "location_map": new_location_map,
    }


def get_grid_map(loc):
    try:
        grid_inst = GridMap.objects.get(loc=loc)
    except GridMap.DoesNotExist:
        create_grids()
        grid_inst = GridMap.objects.get(loc=loc)

    map_dic = {
        "image_map": grid_inst.grid_image,
        "location_map": grid_inst.grid_location,
    }
    return map_dic

def get_grid_ajax(request):
    loc = request.GET.get("loc", None)
    data = combine_all_grid_maps(request)
    return JsonResponse(data)

def view_map(request):
    return render(
        request,
        'warehouse_map/map.html',
        context={
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

def create_grids():
    def create_f_map():
        f_loc_sub = "USLA.F."
        va_loc_sub = "USLA.VA."
        width = 128
        height = 112
        double_rack_status = False
        prev_x = 0

        f_grid = GridMap(loc="F", width=width, height=height)
        f_grid.create_grids()

        # First Aisle
        f_grid.add_rack_aisle(0, 0, True, f_loc_sub + "1", 21, 7, True)
        f_grid.add_rack_aisle(0, 7*4 + 4 * 7, True, f_loc_sub + "1", 14, 14, True)

        for i in range(42):
            # For now, vertical (True) means that columns decrements
            if double_rack_status:
                next_x = prev_x + 2
                prev_x = next_x
                double_rack_status = False
            else:
                next_x = prev_x + 4
                prev_x = next_x
                double_rack_status = True

            f_grid.add_rack_aisle(next_x, 0, True, f_loc_sub + str(i+2), 13, 13, True)
            f_grid.add_rack_aisle(next_x, 13*4+4, True, va_loc_sub + str(i+2), 14, 14, True)

        f_grid.save()

        return {
            "image_map": f_grid.grid_image,
            "location_map": f_grid.grid_location,
        }

    def create_p_map():
        p_loc_sub = "USLA.P."
        width = 96
        height = 80

        double_rack_status = False
        prev_y = 0

        p_grid = GridMap(loc="P", width=width, height=height)
        p_grid.create_grids()

        # Aisle 1
        p_grid.add_rack_aisle(0, 0, False, p_loc_sub + "1", 1, 2, False)
        p_grid.add_rack_aisle(16, 0, False, p_loc_sub + "1", 3, 5, False)
        p_grid.add_rack_aisle(40, 0, False, p_loc_sub + "1", 8, 5, False)
        p_grid.add_rack_aisle(64, 0, False, p_loc_sub + "1", 13, 5, False)

        for i in range(26):
            if double_rack_status:
                next_y = prev_y + 2
                prev_y = next_y
                double_rack_status = False
            else:
                next_y = prev_y + 4
                prev_y = next_y
                double_rack_status = True
            p_grid.add_rack_aisle(0, next_y, False, p_loc_sub + str(i+2), 1, 12, False)
            p_grid.add_rack_aisle(52, next_y, False, p_loc_sub + str(i+2), 13, 11, False)

        p_grid.save()

        return {
            "image_map": p_grid.grid_image,
            "location_map": p_grid.grid_location,
        }

    def create_s_map():
        s_loc_sub = "USLA.S."
        rack_loc_sub = "USLA.H."
        width = 90
        height = 91
        double_rack_status = False
        prev_y = 0

        s_grid = GridMap(loc="S", width=width, height=height)
        s_grid.create_grids()

        first_rack_y = 0
        second_rack_y = 30
        third_rack_y = 52

        # H RACKS
        s_grid.add_rack_aisle(0, first_rack_y, True, rack_loc_sub + "1", 18, 7, True)
        s_grid.add_rack_aisle(0, second_rack_y, True, rack_loc_sub + "1", 11, 5, True)
        s_grid.add_rack_aisle(0, third_rack_y, True, rack_loc_sub + "1", 6, 6, True)

        # S Racks Aisles 25-56
        for i in range(32):
            if double_rack_status:
                next_y = prev_y + 1
                prev_y = next_y
                double_rack_status = False
            else:
                next_y = prev_y + 2
                prev_y = next_y
                double_rack_status = True

            s_grid.add_shelf_aisle(4, next_y, False, s_loc_sub + str(56 - i), 42, 18, True)
            s_grid.add_shelf_aisle(42, next_y, False, s_loc_sub + str(56 - i), 24, 24, True)

        double_rack_status = False
        prev_y = third_rack_y -1

        # S Racks Aisles 11 - 24
        for i in range(14):
            if double_rack_status:
                next_y = prev_y + 1
                prev_y = next_y
                double_rack_status = False
            else:
                next_y = prev_y + 2
                prev_y = next_y
                double_rack_status = True

            s_grid.add_shelf_aisle(4, next_y, False, s_loc_sub + str(24 - i), 42, 18, True)
            s_grid.add_shelf_aisle(42, next_y, False, s_loc_sub + str(24 - i), 24, 24, True)

        double_rack_status = False
        prev_y = 75

        # S Racks Aisles 1 - 10
        for i in range(10):
            if double_rack_status:
                next_y = prev_y + 1
                prev_y = next_y
                double_rack_status = False
            else:
                next_y = prev_y + 2
                prev_y = next_y
                double_rack_status = True
            s_grid.add_shelf_aisle(22, next_y, False, s_loc_sub + str(10 - i), 33, 9, True)
            s_grid.add_shelf_aisle(42, next_y, False, s_loc_sub + str(10 - i), 24, 24, True)

        s_grid.save()

        return {
            "image_map": s_grid.grid_image,
            "location_map": s_grid.grid_location,
        }

    def create_vc_map():
        vc_loc_sub = "USLA.VC."
        rack_loc_sub = "USLA.VA."
        h_loc_sub = "USLA.H."
        width = 35
        height = 72

        vc_grid = GridMap(loc="VC", width=width, height=height)
        vc_grid.create_grids()

        # VA RACKS
        vc_grid.add_rack_aisle(9, 0, False, rack_loc_sub + "44", 22, 5, True)
        vc_grid.add_rack_aisle(33, 0, True, rack_loc_sub + "44", 17, 6, True)
        vc_grid.add_rack_aisle(33, 28, True, rack_loc_sub + "44", 10, 5, True)
        vc_grid.add_rack_aisle(33, 52, True, rack_loc_sub + "44", 5, 5, True)


        # H Racks
        double_rack_status = True
        prev_x = 0

        for i in range(6):
            if double_rack_status:
                next_x = prev_x + 2
                prev_x = next_x
                double_rack_status = False
            else:
                next_x = prev_x + 7
                prev_x = next_x
                double_rack_status = True
            vc_grid.add_rack_aisle(next_x, 4, True, h_loc_sub + '8', 1, 5, False)

        # VC Shelves
        double_rack_status = False
        prev_y = 23

        for i in range(32):
            if double_rack_status:
                next_y = prev_y + 1
                prev_y = next_y
                double_rack_status = False
            else:
                next_y = prev_y + 2
                prev_y = next_y
                double_rack_status = True

            vc_grid.add_shelf_aisle(0, next_y, False, vc_loc_sub + str(i), 15, 15, True)


        vc_grid.save()

        return {
            "image_map": vc_grid.grid_image,
            "location_map": vc_grid.grid_location,
        }

    create_f_map()
    create_s_map()
    create_vc_map()
    create_p_map()