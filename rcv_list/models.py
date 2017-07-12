from django.db import models
import datetime, os
import django
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver
from django.conf import settings


class RCV(models.Model):
    rcv_number = models.CharField(max_length=20, default='')
    filename = models.CharField(max_length=50, default="")
    date = models.DateField(auto_now=True)
    correct_name = models.BooleanField(default=False)


    def __str__(self):
        return self.filename

    @receiver(pre_delete)
    def delete_file(sender, instance, using, **kwargs):
        filepath = os.path.join(settings.MEDIA_ROOT, "rcv", instance.filename)
        os.remove(filepath)
        # super(RCV, self).delete(*args, **kwargs)
