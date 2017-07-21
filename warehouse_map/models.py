from django.db import models

class Test(models.Model):
    test_field  = models.CharField(max_length=50)

class RackLocation(models.Model):
    location = models.CharField(max_length=20)
    area = models.CharField(max_length=2)
    warehouse_location = models.CharField(max_length=10)
    aisle = models.CharField(max_length=3)
    level = models.CharField(max_length=2)
    column = models.CharField(max_length=2)

class DataDate(models.Model):
    date = models.DateTimeField()

class Customer(models.Model):
    customer_code = models.IntegerField()

class ItemInfo(models.Model):
    name = models.CharField(max_length=75)
    sku_name = models.CharField(max_length = 45)
    sku_code = models.IntegerField()
    customer_code = models.ForeignKey(Customer, on_delete=models.CASCADE)

class ItemDateInfo(models.Model):
    data_date = models.ForeignKey(DataDate, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    ship_quantity = models.IntegerField()
    rack_location = models.ManyToManyField(RackLocation)

class ItemInputInfo(models.Model):
    inven_date = models.DateTimeField()
    rcv = models.CharField(max_length=20)
    item_date_info = models.ForeignKey(ItemDateInfo, on_delete=models.CASCADE)
    item_info = models.ForeignKey(ItemInfo, on_delete=models.CASCADE)