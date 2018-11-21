from django.db import models

# Create your models here.
class TrackingType(models.Model):
    name = models.CharField(max_length=50)

class Tracking_Number(models.Model):
    number = models.CharField(max_length=25)
    input_date = models.DateTimeField(auto_now_add=True)
    tracking_type =  models.ForeignKey(TrackingType, on_delete=models.CASCADE, blank=True, null=True)
    note = models.TextField()