from django.db import models
from datetime import datetime

# Vendors that items were purchased from
class Vendor(models.Model):
    name = models.CharField(max_length=50)
    website = models.TextField()

# Item type category for the items
class ItemType(models.Model):
    name = models.CharField(max_length=20)

# Item that make up a purchase.
# Ctaonsin Vendor and ItemType
class Item(models.Model):
    name = models.CharField(max_length=50)
    amount = models.DecimalField(decimal_places=2, max_digits=11)
    quantity = models.IntegerField()
    note = models.TextField()

    item_type = models.ForeignKey(ItemType, on_delete=models.CASCADE)

# Payment for each purchase. Might be changed later for actual payment types
class Payment(models.Model):
    name = models.CharField(max_length=30)

# Department that the purchases were for
# Location refers to city / warehouse
class Department(models.Model):
    name = models.CharField(max_length=20)
    location = models.CharField(max_length=30)

# Purchase to be saved by user
# Contains Items, Department, Payment
class Purchase(models.Model):
    input_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    purchase_date = models.DateField()

    order_num = models.CharField(max_length=50)

    total = models.DecimalField(decimal_places=2, max_digits=11)
    note = models.TextField()

    invoice = models.FileField(upload_to='inventory_invoices/%Y/%m/%d/')

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    items = models.ManyToManyField(Item)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)