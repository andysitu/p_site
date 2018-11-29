from django.contrib import admin
from .models import TrackingType, Tracking_Number

# Register your models here.
class TrackingTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)
admin.site.register(TrackingType, TrackingTypeAdmin)
    
class Tracking_NumberAdmin(admin.ModelAdmin):
    list_display = ('number', 'input_date', 'receive_date', 'tracking_type', 'note')

admin.site.register(Tracking_Number, Tracking_NumberAdmin)