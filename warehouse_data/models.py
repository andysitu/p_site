from django.db import models
from django.contrib.postgres.fields import ArrayField

import datetime
from django.dispatch import receiver
from django.db.models import Q

import re

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
        if aisle_num == 60:
            loc = "VC"
        else:
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

def filter_item_query_by_loc(item_query, loc):
    if loc == "P":
        return item_query.filter( Q(rack_location__area="PH") | Q(rack_location__area="PA"))
    elif loc == "VC":
        q1 = Q(rack_location__area="VC")
        q2 = Q(rack_location__area="VD")
        q3 = (Q(rack_location__aisle_num=44) & Q(rack_location__area="VA"))
        q4 = (Q(rack_location__aisle_num=44) & Q(rack_location__area="VB"))
        q5 = (Q(rack_location__aisle_num=60) & Q(rack_location__area="S"))
        q6 = (Q(rack_location__area="H") & Q(rack_location__aisle_num__lte=6) & ~Q(rack_location__aisle_letter="H") )
        return item_query.filter(q1 | q2 | q3 | q4 | q5 | q6)
    elif loc == "S":
        q1 = (~Q(rack_location__aisle_num=60) & Q(rack_location__area="S"))
        q2 = (Q(rack_location__area="H" ) & Q(rack_location__aisle_letter="H"))
        q3 = (Q(rack_location__area="H") & Q(rack_location__aisle_num=8))
        return item_query.filter(q1 | q2 | q3)
    elif loc == "F":
        q1 = Q(rack_location__area="F")
        q2 = (~Q(rack_location__aisle_num=44) & Q(rack_location__area="VA"))
        q3 = (~Q(rack_location__aisle_num=44) & Q(rack_location__area="VB"))
        return item_query.filter(q1 | q2 | q3)
    return item_query

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

    def get_input_date(self):
        rcv = self.rcv
        recv_re = re.compile("^RECV")
        if recv_re.match(rcv):
            return self.iv_create_date
        else:
            return self.fifo_date