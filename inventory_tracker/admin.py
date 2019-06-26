from django.contrib import admin
from .models import *

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('name',)
admin.site.register(Payment, PaymentAdmin)
    
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name','itemType',)

admin.site.register(Item, ItemAdmin)

class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')

admin.site.register(Department, DepartmentAdmin)

class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'purchase_date', 'vendor')

admin.site.register(Purchase, PurchaseAdmin)