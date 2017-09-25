from django.db import models
import django

class File(models.Model):
    filename = models.CharField(max_length=50)
    uploaded_date = models.DateTimeField(default=django.utils.timezone.now)
    note = models.TextField(max_length=200)
    file_path = models.CharField(max_length=100, default="")

    def __str__(self):
        return self.filename