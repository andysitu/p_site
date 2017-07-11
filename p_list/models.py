from django.db import models
import datetime
import django
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver


class TestModel(models.Model):
    """
	Just creating a model for testing purposes
	"""

    num_times = models.IntegerField()


class RCV(models.Model):
    rcvfile = models.FileField(
        upload_to='rcv/',
    )
    filename = models.CharField(max_length=50, default="")
    date = models.DateField(auto_now=True)

    def __str__(self):
        return self.filename

@receiver(pre_delete, sender=RCV)
def delete_rcvfile(sender, instance, **kwargs):
    instance.rcvfile.delete(False)
