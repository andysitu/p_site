from django.db import models
import django

class CustomsDeclaration(models.Model):
    customs_number = models.CharField(max_length=13, default="")
    filename = models.CharField(max_length=50, default="")
    upload_date = models.DateField(default=django.utils.timezone.now)

    def __str__(self):
        return self.filename