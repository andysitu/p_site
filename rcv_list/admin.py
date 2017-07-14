from django.contrib import admin
from .models import RCV

class RCVAdmin(admin.ModelAdmin):
    list_display = ('rcv_number', 'correct_name', 'upload_date')
    list_filter = ('upload_date', 'rcv_date')

admin.site.register(RCV, RCVAdmin)