from django.db import models
import django

class CustomsDeclaration(models.Model):
    customs_file = models.FileField(
        upload_to='customs_delcaraction/'
    )

    customs_number = models.CharField(max_length=13)
    filename = models.CharField(max_length=50)
    upload_date = models.DateField(default=django.utils.timezone.now)

    def __str__(self):
        return self.filename