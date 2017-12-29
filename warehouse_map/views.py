from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required
from django.core import serializers
from .forms import UploadExcelData, XMLRequestGridForm

from .models import Test, GridMap

from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder
import json

from warehouse_data import processor as processor

from django.contrib.auth.decorators import user_passes_test

class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, YourCustomType):
            return force_text(obj)
        return super(LazyEncoder, self).default(obj)

def get_grid_map(loc, data_type = None):
    try:
        grid_inst = GridMap.objects.get(loc=loc)
    except GridMap.DoesNotExist:
        create_grids()
        grid_inst = GridMap.objects.get(loc=loc)
        if data_type:
            data_map = processor.get_data_map(grid_inst.grid_location, data_type)
    map_dic = {
        "loc": loc,
        "image_map": grid_inst.grid_image,
        "location_map": grid_inst.grid_location,
        "num_down": grid_inst.height,
        "num_across": grid_inst.width,
    }
    return map_dic

def view_map(request):
    return render(
        request,
        'warehouse_map/map.html',
        context={

        },
    )

@login_required
def upload_excel_data(request):
    upload_response = 0

    date_inst_list = processor.get_datadates(20)

    if request.method == 'POST':
        response_excel_data_form = UploadExcelData(request.POST, request.FILES)
        if response_excel_data_form.is_valid():
            for file in request.FILES.getlist("excel_data_file"):
            # file = request.FILES["excel_data_file"]
                upload_response = processor.process_excel_file(file)

    upload_excel_data_form = UploadExcelData()

    date_list = []
    for data_date in date_inst_list:
        date_list.append(data_date.date.astimezone().strftime("%m/%d/%Y-%I:%M%p"))

    return render(
        request,
        'warehouse_map/upload_excel_data.html',
        context={
            "upload_form": upload_excel_data_form,
            "date_list": date_list,
            "upload_response": upload_response,
        }
    )

@user_passes_test(lambda u: u.is_superuser)
def reset_db(request):
    processor.reset_db()
    return redirect("warehouse_map:index")

@user_passes_test(lambda u: u.is_superuser)
def reset_db_true(request):
    processor.reset_db(delete_rack=True)
    delete_grids()
    return redirect("warehouse_map:index")

@login_required
def reset_grid_map(request):
    delete_grids()
    return redirect("warehouse_map:index")

def get_info(request):
    d = processor.get_info()

    return render(
        request,
        "warehouse_map/warehouse_info.html",
        context={
            "data_date": d,
        }
    )

def delete_grids():
    GridMap.objects.all().delete()

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

            f_grid.add_rack_aisle(next_x, 0, True, va_loc_sub + str(i+2), 13, 13, True)
            f_grid.add_rack_aisle(next_x, 13*4+4, True, f_loc_sub + str(i+2), 14, 14, True)

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

        # Aisle 26
        p_grid.add_rack_aisle(0, 0, False, p_loc_sub + "27", 1, 2, False)
        p_grid.add_rack_aisle(16, 0, False, p_loc_sub + "27", 3, 5, False)
        p_grid.add_rack_aisle(40, 0, False, p_loc_sub + "27", 8, 5, False)
        p_grid.add_rack_aisle(64, 0, False, p_loc_sub + "27", 13, 5, False)

        for i in range(26):
            if double_rack_status:
                next_y = prev_y + 2
                prev_y = next_y
                double_rack_status = False
            else:
                next_y = prev_y + 4
                prev_y = next_y
                double_rack_status = True
            p_grid.add_rack_aisle(0, next_y, False, p_loc_sub + str(26-i), 1, 12, False)
            p_grid.add_rack_aisle(52, next_y, False, p_loc_sub + str(26-i), 13, 11, False)

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
        s_grid.add_rack_aisle(0, first_rack_y, True, rack_loc_sub + "8", 18, 7, True)
        s_grid.add_rack_aisle(0, second_rack_y, True, rack_loc_sub + "8", 11, 5, True)
        s_grid.add_rack_aisle(0, third_rack_y, True, rack_loc_sub + "8", 6, 6, True)

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
        height = 99

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
            vc_grid.add_rack_aisle(next_x, 4, True, h_loc_sub + str(6-i), 1, 5, False)

        # VC Shelves
        double_rack_status = False
        prev_y = 23

        for i in range(48):
            if double_rack_status:
                next_y = prev_y + 1
                prev_y = next_y
                double_rack_status = False
            else:
                next_y = prev_y + 2
                prev_y = next_y
                double_rack_status = True

            vc_grid.add_shelf_aisle(0, next_y, False, vc_loc_sub + str(i+1), 15, 15, True)


        vc_grid.save()

        return {
            "image_map": vc_grid.grid_image,
            "location_map": vc_grid.grid_location,
        }

    create_f_map()
    create_s_map()
    create_vc_map()
    create_p_map()