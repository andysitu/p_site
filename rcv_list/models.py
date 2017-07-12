from django.db import models
import datetime, os, re
import django
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver
from django.conf import settings

rcv_foldername = 'rcv'

class RCV(models.Model):
    rcv_number = models.CharField(max_length=20, default='')
    filename = models.CharField(max_length=50, default="")
    rcv_date = models.DateField(default=django.utils.timezone.now)
    correct_name = models.BooleanField(default=False)

    def __str__(self):
        return self.filename

    @receiver(pre_delete)
    def delete_file(sender, instance, using, **kwargs):
        filepath = os.path.join(settings.MEDIA_ROOT, rcv_foldername, instance.filename)
        os.remove(filepath)
        # super(RCV, self).delete(*args, **kwargs)

    def edit(self, rcv_number):
        filename = rcv_number + ".pdf"

        old_path = os.path.join(settings.MEDIA_ROOT, rcv_foldername, self.filename)
        new_path = os.path.join(settings.MEDIA_ROOT, rcv_foldername, filename)

        os.rename(old_path, new_path)
        self.filename = filename
        self.rcv_number = rcv_number

        rcv_re = re.compile('(RCV|RECV)(\d{2})(\d{2})(\d{2})\-\d{4}')

        re_results = re.search(rcv_re, rcv_number)
        if re_results != None:
            year = int('20' + re_results.group(2))
            month = int(re_results.group(3))
            day = int(re_results.group(4))

            d = datetime.date(year, month, day)
            self.upload_date = d
            self.correct_name = True
        self.save()