from django.db import models

import datetime
from django.dispatch import receiver

class Location(models.Model):
    # loc is my own classification of location
    loc = models.CharField(max_length=20)
    warehouse_location = models.CharField(max_length=10, default="USLA")
    area = models.CharField(max_length=2)
    aisle_letter = models.CharField(max_length=3, default="")
    aisle_num = models.IntegerField()
    level = models.IntegerField()
    column = models.IntegerField()

    def __str__(self):
        loc_name = self.warehouse_location + "." + self.area + "." +\
                   self.aisle_letter + str(self.aisle_num) + "." + \
                   str(self.column) + "." + str(self.level)
        return loc_name

class DataDate(models.Model):
    date = models.DateTimeField()

class Items(models.Model):
    item_id = models.IntegerField()
    avail_quantity = models.IntegerField()
    ship_quantity = models.IntegerField()
    location_code = models.CharField(max_length=20, default="")
    fifo_date = models.DateTimeField()
    iv_create_date = models.DateTimeField(default=datetime.datetime.now)
    rack_location = models.ForeignKey(Location, on_delete=models.CASCADE, default=None)
    rcv = models.CharField(max_length=20)
    data_date = models.ForeignKey(DataDate, on_delete=models.CASCADE, default=None)
    description = models.CharField(max_length=100, default="")
    item_code = models.CharField(max_length=50, default="")
    customer_code = models.IntegerField(default="0")


def delete_all_rack_location():
    racks_query = Location.objects.all()
    for r in racks_query:
        r.delete()

def populate_rack_location():
    populate_p_area()

    populate_s_area()
    populate_h_rack_of_s()

    populate_h_locked_area()

    populate_vc_area()
    populate_va_rac_of_vc()

    populate_f_rack()

    populate_va_rack()

    make_unknown_area()

def make_location_area(loc,
                       area,
                       aisle_end,
                       column_end,
                       level_end,
                       warehouse="USLA",
                       aisle_letter="",
                       aisle_start=1,
                       column_start=1,
                       level_start=1,
                       ):

    for aisle_num in range(aisle_start, aisle_end + 1):
        for column in range(column_start, column_end + 1):
            for level in range(level_start, level_end + 1):
                location_instance = Location(area=area,
                             aisle_letter=aisle_letter,
                             aisle_num=aisle_num,
                             column=column,
                             level=level,
                             loc=loc,
                             warehouse_location=warehouse, )
                location_instance.save()

def make_unknown_area():
    make_location_area(loc='Unknown', area='', aisle_letter='', aisle_end=1,
                       column_end=1, level_end=1)
def populate_p_area():
    loc = "P"
    loc_before_27_aisle = {
        "loc": loc,
        "aisle_end":26,
        "column_end":23
    }

    loc_27_aisle = {
        "loc": loc,
        "aisle_start":27,
        "aisle_end": 27,
        "column_end":17,
    }

    # Make PA
    make_location_area(level_end=1,area='PA', **loc_before_27_aisle)
    make_location_area(level_end=1,area='PA', **loc_27_aisle)
    # Make PH
    make_location_area(level_start=2, level_end=3,area='PH', **loc_before_27_aisle)
    make_location_area(level_start=2, level_end=3,area='PH', **loc_27_aisle)
def populate_s_area():
    loc = 'S'

    # Aisles 1-10
    make_location_area(loc='S',area='S',aisle_letter='S',aisle_end=10,
                       column_end=33,level_end=4)
    make_location_area(loc='S', area='H',aisle_letter='H',aisle_end=10,
                       column_end=33,level_start=5,level_end=6)

    # Aisles 11-26
    make_location_area(loc='S',area='S', aisle_letter='S', aisle_start=11, aisle_end=26,
                       column_end=42, level_end=4)
    make_location_area(loc='S', area='H',aisle_letter='H', aisle_start=11, aisle_end=26,
                       column_end=42, level_end=6)

    # Aisles 27-42
    make_location_area(loc='S', area='S', aisle_letter='S', aisle_start=27, aisle_end=42,
                       column_end=42, level_end=4)
    make_location_area(loc='S', area='H', aisle_letter='H', aisle_start=27, aisle_end=42,
                       column_end=42, level_end=5)

    # Aisles 43-56
    make_location_area(loc='S', area='S', aisle_letter='S', aisle_start=43, aisle_end=56,
                       column_end=42, level_end=4)
    make_location_area(loc='S', area='H', aisle_letter='H', aisle_start=43, aisle_end=56,
                       column_end=42, level_end=6)
def populate_h_rack_of_s():
    make_location_area(loc='S', area='H', aisle_start=8, aisle_end=8,
                       column_end=18,level_end=3)
def populate_h_locked_area():
    make_location_area(loc='H_locked', area='H', aisle_end=6,
                       column_end=5, level_end=3)
def populate_vc_area():
    loc_dic = {
        "loc": "VC",
        "aisle_end": 32,
        "column_end": 15,
    }

    make_location_area(area='VC', level_end=3, **loc_dic)
    make_location_area(area='VD', level_start=4,level_end=5, **loc_dic)
def populate_va_rac_of_vc():
    loc_dic = {
        "loc": "VC",
        "aisle_start": 44,
        "aisle_end": 44,
        "column_end": 22,
    }
    make_location_area(area='VA', level_end=1, **loc_dic)
    make_location_area(area='VB', level_start=2, level_end=3, **loc_dic)

def populate_f_rack():
    # First Level
    # Aisle 1
    make_location_area(loc='F', area='F', aisle_letter='F', aisle_start=1, aisle_end=1,
                       column_end=21, level_end=1)
    # Rest of aisles
    make_location_area(loc='F', area='F', aisle_letter='F', aisle_start=2, aisle_end=43,
                       column_end=14, level_end=1)

    # Levels 2 & 3
    # Aisle 1
    make_location_area(loc='F', area='F', aisle_start=1, aisle_end=1,
                       column_end=21, level_start=2, level_end=3)
    # Rest of aisles
    make_location_area(loc='F', area='F', aisle_start=2, aisle_end=43,
                       column_end=14, level_start=2, level_end=3)
def populate_va_rack():
    loc_dic = {
        "loc": "F",
        "aisle_end": 43,
        "column_end": 13,
    }

    make_location_area(area='VA', level_end=1, **loc_dic)
    make_location_area(area='VB', level_start=2, level_end=3, **loc_dic)