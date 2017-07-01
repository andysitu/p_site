from django.db import models
import datetime
import django


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
    date = models.DateField(default=django.utils.timezone.now, auto_now=True)

    def __str__(self):
        return self.filename
