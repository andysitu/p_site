from django.contrib import admin
from .models import GridMap, Test

class GridMapAdmin(admin.ModelAdmin):
    list_display = ('loc', 'width', 'height',)

admin.site.register(GridMap, GridMapAdmin)
