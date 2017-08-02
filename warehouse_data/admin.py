from django.contrib import admin
from .models import RackLocation, Item, DataDate

class RackLocationAdmin(admin.ModelAdmin):
    list_display = ('loc', 'warehouse_location', 'area', 'aisle_letter', 'level', 'column', 'location_code')

admin.site.register(RackLocation, RackLocationAdmin)

class ItemAdmin(admin.ModelAdmin):
    list_display = ("id", "rack_location", "data_date", "quantity")

admin.site.register(Item, ItemAdmin)

class DataDateAdmin(admin.ModelAdmin):
    list_display = ("date",)

admin.site.register(DataDate, DataDateAdmin)