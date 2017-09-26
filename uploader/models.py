from django.db import models
import django, os
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver
from django.conf import settings
from django.contrib.auth.models import User

class UFileManager(models.Model):
    name = models.CharField(max_length = 50)
    count = models.IntegerField(default=0)

class UFile(models.Model):
    filename = models.CharField(max_length=50)
    uploaded_date = models.DateTimeField(default=django.utils.timezone.now)
    file_manager = models.ForeignKey(UFileManager, on_delete=models.CASCADE)

    def __str__(self):
        return self.filename

    @receiver(pre_delete, sender=User)
    def delete_file(sender, instance, using, **kwargs):
        try:
            folder_name = instance.file_manager.name
            filepath = os.path.join(settings.MEDIA_ROOT, "uploader", folder_name, instance.filename)
            os.remove(filepath)
        except FileNotFoundError:
            pass

class Note:
    txt = models.TextField(max_length=200)
    file_manager = models.ForeignKey(UFileManager, on_delete=models.CASCADE)