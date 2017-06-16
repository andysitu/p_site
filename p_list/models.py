from django.db import models

class TestModel(models.Model):
	"""
	Just creating a model for testing purposes
	"""

	num_times = models.IntegerField()

class RCV(models.Model):
    rcvfile = models.FileField(upload_to='rcv/')
    filename = models.CharField(max_length=50, default="")