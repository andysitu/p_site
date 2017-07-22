from django.db import models
import uuid

class Test(models.Model):
    test_field  = models.CharField(max_length=50)

class RackLocation(models.Model):
    location = models.CharField(max_length=20)
    area = models.CharField(max_length=2)
    warehouse_location = models.CharField(max_length=10)
    aisle = models.CharField(max_length=3)
    level = models.CharField(max_length=2)
    column = models.CharField(max_length=2)

class RCV(models.Model):
    rcv = models.CharField(max_length=20)

class DataDate(models.Model):
    date = models.DateTimeField()

class Customer(models.Model):
    customer_code = models.IntegerField()

class ItemInfo(models.Model):
    # Permanent item info that is the same for all items of same time
    description = models.CharField(max_length=75)
    sku_name = models.CharField(max_length = 45)
    customer_code = models.ForeignKey(Customer, on_delete=models.CASCADE)

class Item(models.Model):
    # Info that will change constantly
    id = models.UUIDField(primary_key=True, default =uuid.uuid4, editable=False)
    quantity = models.IntegerField()
    ship_quantity = models.IntegerField()
    rack_location = models.ManyToManyField(RackLocation)
    inven_date = models.DateTimeField()

    data_date = models.ForeignKey(DataDate, on_delete=models.CASCADE)
    rcv = models.ForeignKey(RCV, on_delete=models.CASCADE)
    item_info = models.ForeignKey(ItemInfo, on_delete=models.CASCADE)