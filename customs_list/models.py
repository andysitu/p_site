from django.db import models
import django, os, re
from django.conf import settings

class CustomsDeclaration(models.Model):
    customs_number = models.CharField(max_length=50, default="")
    filename = models.CharField(max_length=50, default="")
    upload_date = models.DateField(default=django.utils.timezone.now)
    correct_name = models.BooleanField(default=False)

    def __str__(self):
        return self.filename

    def edit(self, customs_number):
        filename = customs_number + ".pdf"
        old_path = os.path.join(settings.MEDIA_ROOT, "customs_declaration", self.filename)
        new_path = os.path.join(settings.MEDIA_ROOT, "customs_declaration", filename)

        os.rename(old_path, new_path)
        self.filename = filename
        self.customs_number = customs_number

        customs_regex = re.compile('1100000\d{5}')
        if re.match(customs_regex, customs_number):
            self.correct_name = True
        self.save()


    def delete(self, *args, **kwargs):
        os.remove(os.path.join(settings.MEDIA_ROOT, "customs_declaration", self.filename))
        super(CustomsDeclaration, self).delete(*args, **kwargs)
