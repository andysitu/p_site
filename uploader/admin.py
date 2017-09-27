from django.contrib import admin
from .models import UFileManager, UFile, Note

admin.site.register(UFile)

admin.site.register(UFileManager)

admin.site.register(Note)