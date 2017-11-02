from django.contrib import admin
from .models import Location, DataDate, Items, Total_Item_Info

class LocationAdmin(admin.ModelAdmin):
    list_display = ('loc', 'warehouse_location', 'area', 'aisle_letter', 'aisle_num', 'level', 'column')
    list_filter = ('loc', 'area', 'aisle_letter',)

admin.site.register(Location, LocationAdmin)

class ItemsAdmin(admin.ModelAdmin):
    list_display = ("rack_location", "avail_quantity", "ship_quantity", "location_code")
    search_fields = ["location_code"]

admin.site.register(Items, ItemsAdmin)

class DataDateAdmin(admin.ModelAdmin):
    list_display = ("date",)

admin.site.register(DataDate, DataDateAdmin)

class TotalItemInfoAdmin(admin.ModelAdmin):
    list_dislay = ("total",)

admin.site.register(Total_Item_Info, TotalItemInfoAdmin)