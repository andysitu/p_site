from django.contrib import admin
from .models import Location, DataDate, Items

class LocationAdmin(admin.ModelAdmin):
    list_display = ('loc', 'warehouse_location', 'area', 'aisle_letter', 'aisle_num', 'level', 'column')
    list_filter = ('area', 'aisle_letter',)

admin.site.register(Location, LocationAdmin)

class ItemsAdmin(admin.ModelAdmin):
    list_display = ("rack_location", "avail_quantity", "ship_quantity",)

admin.site.register(Items, ItemsAdmin)

class DataDateAdmin(admin.ModelAdmin):
    list_display = ("date",)

admin.site.register(DataDate, DataDateAdmin)