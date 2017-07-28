from django.contrib import admin
from .models import RackLocation

class RackLocationAdmin(admin.ModelAdmin):
    list_display = ('loc', 'warehouse_location', 'area', 'aisle', 'level', 'column', 'location_code')

admin.site.register(RackLocation, RackLocationAdmin)