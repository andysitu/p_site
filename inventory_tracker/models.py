from django.db import models
from datetime import datetime

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

    order_number = models.CharField(max_length=50)

    total = models.DecimalField(decimal_places=2, max_digits=11)
    note = models.TextField()

    vendor = models.CharField(max_length=50,blank=True, null=True)

    invoice = models.FileField(upload_to='inventory_invoices/%Y/%m/%d/')

    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)

# Item that make up a purchase.
# Ctaonsin Vendor and ItemType
class Item(models.Model):
    name = models.CharField(max_length=50)
    amount = models.DecimalField(decimal_places=2, max_digits=11)
    quantity = models.IntegerField()
    note = models.TextField()
    itemType = models.TextField(blank=True, null=True)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, blank=True, null=True)

    def get_info(self):
        o = {}
        o["name"] = self.name
        o["amount"] = self.name
        o["quantity"] = self.quantity
        o["note"] = self.note
        o["item_type"] = self.itemType
        o["purchase_date"] = self.purchase.purchase_date

        return o