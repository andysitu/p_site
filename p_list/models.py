from django.db import models

class TestModel(models.Model):
	"""
	Just creating a model for testing purposes
	"""

	num_times = models.IntegerField()
