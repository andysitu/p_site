from django.db import models

import uuid
from django.dispatch import receiver

def delete_all_rack_location():
    racks_query = RackLocation.objects.all()
    for r in racks_query:
        r.delete()

def populate_rack_location():
    populate_p_area()
    populate_s_area()
    populate_h_rack_of_s()
    populate_h_area()
    populate_v_area()
    populate_v_rack()

def populate_p_area():
    loc = 'P'

    num_aisles = 27
    levels = 3

    for a in range(1, num_aisles + 1):
        aisle = "%02d" % a

        if a != 27:
            columns = 23
        else:
            columns = 17
        for c in range(1, columns + 1):
            column = "%02d" % c
            for l in range(1, levels + 1):
                level = "%d" % l
                if l == 1:
                    area = "PA"
                else:
                    area = "PH"
                r = RackLocation(area = area,
                                 aisle = aisle,
                                 level = level,
                                 column = column,
                                 loc = loc,
                                 )
                r.save()
def populate_s_area():
    loc = 'S'

    # populate s & h shelves
    num_aisles = 56
    for a in range(1, num_aisles+1):
        if a >= 27 and a <= 42:
            levels = 5
        else:
            levels = 6

        if a >= 11:
            columns = 42
        else:
            columns = 33
        for c in range(1, columns+1):
            column = "%02d" % c
            for l in range(1, levels+1):
                level = "%1d" % l
                if l >= 5:
                    area = "H"
                    aisle = "H" + "%02d" % a
                else:
                    area = "S"
                    aisle = "S" + "%02d" % a

                r = RackLocation(area = area,
                                 aisle = aisle,
                                 column = column,
                                 level = level,
                                 loc = loc)
                r.save()
def populate_h_rack_of_s():
    loc = 'S'
    area = 'H'
    aisle="8"
    columns = 18
    levels = 3
    for c in range(1, columns+1):
        column = "%02d" % c
        for l in range(1, levels+1):
            level = "%1d" % l
            r = RackLocation(area = area,
                             aisle = aisle,
                             column = column,
                             level = level,
                             loc = loc,
                             )
            r.save()
def populate_h_area():
    loc = "H"
    area = "H"
    num_aisles = 6
    columns = 5
    levels = 3
    for a in range(1, num_aisles+1):
        aisle = "%1d" % a
        for c in range(1, columns+1):
            column = "%02d" % c
            for l in range(1, levels+1):
                level = "%1d" % l
                r = RackLocation(area=area,
                                 aisle=aisle,
                                 column=column,
                                 level=level,
                                 loc=loc,
                                 )
                r.save()
def populate_v_area():
    loc = "V"
    num_aisles = 32
    columns = 15
    levels = 5
    for a in range(1, num_aisles+1):
        aisle = "%02d" % a
        for c in range(1, columns+1):
            column = "%02d" % c
            for l in range(1, levels+1):
                level = "%1d" % l
                if l >= 4:
                    area = "VD"
                else:
                    area = "VC"
                r = RackLocation(area=area,
                                 aisle=aisle,
                                 column=column,
                                 level=level,
                                 loc=loc,
                                 )
                r.save()
def populate_v_rack():
    loc = "V"
    aisle = "44"
    columns = 22
    levels = 3
    for c in range(1, columns+1):
        column = "%02d" % c
        for l in range(1, levels+1):
            level = "%01d" % l
            if l >= 2:
                area = "VB"
            else:
                area = "VA"
            r = RackLocation(area=area,
                             aisle=aisle,
                             column=column,
                             level=level,
                             loc=loc,
                             )
            r.save()

class DataDate(models.Model):
    date = models.DateTimeField()

class Item(models.Model):
    id = models.UUIDField(primary_key=True, default =uuid.uuid4, editable=False)
    quantity = models.IntegerField()
    ship_quantity = models.IntegerField()
    location_code = models.CharField(max_length=20, default="")
    inven_date = models.DateTimeField()

    data_date = models.ForeignKey(DataDate, on_delete=models.CASCADE)
    rcv = models.CharField(max_length=20)
    description = models.CharField(max_length=100)
    sku_name = models.CharField(max_length=50)
    customer_code = models.IntegerField()