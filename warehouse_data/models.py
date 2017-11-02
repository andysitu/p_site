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

def make_location(warehouse_location, area, aisle_letter, aisle_num, column, level):
    location_inst = Location(warehouse_location=warehouse_location,
                             area=area,
                             aisle_letter=aisle_letter,
                             aisle_num=aisle_num,
                             column=column,
                             level=level,
                             )
    loc = ''
    if area == "PH" or area == "PA":
        loc = "P"
    elif area == "S":
        loc = "S"
    elif area == "F":
        loc = "F"
    elif area == "VA" or area == "VB":
        if aisle_num == 44:
            loc = "VC"
        else:
            loc = "F"
    elif area == "VC" or area == "VD":
        loc = "VC"
    elif area == "H":
        if aisle_letter == "H":
            loc = "S"
        elif aisle_num == 8:
            loc = "S"
        elif aisle_num <= 6:
            loc = "VC"
    location_inst.loc = loc

    location_inst.save()
    return location_inst

class DataDate(models.Model):
    date = models.DateTimeField()

class Items(models.Model):
    item_id = models.IntegerField()
    lab_id = models.IntegerField(default = 0)
    item_weight = models.FloatField(default = 0)
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
    last_out_date = models.DateTimeField(blank=True, null=True, default=None)



# Processed data
data_versions = {
    "total_item_count": "1.0.000"
}

class Total_Item_Info(models.Model):
    version = models.CharField(max_length=10, default=data_versions["total_item_count"])
    total = models.IntegerField()
    data_date = models.ForeignKey(DataDate, on_delete=models.CASCADE)

    def check_version(self):
        return self.version == data_versions["total_item_count"]