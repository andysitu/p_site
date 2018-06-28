from django.db import models
import datetime, os, re
import django
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver
from django.conf import settings
from django.contrib.auth.models import User


def get_rcv_filepath(rcv_filename):
    return os.path.join(settings.MEDIA_ROOT, "rcv", rcv_filename)

rcv_foldername = 'rcv'

class RCV(models.Model):
    rcv_number = models.CharField(max_length=50, default='')
    filename = models.CharField(max_length=50, default="")
    original_filename = models.CharField(max_length=50, default='Unknown.pdf')
    # Date that the RCVs were received & put on shelves
    input_date = models.DateField(null=True, blank=True)

    correct_name = models.BooleanField(default=False)
    rcv_date = models.DateField(blank=True, null=True, default=None)

    upload_date = models.DateTimeField(default=django.utils.timezone.now)

    def __str__(self):
        return self.rcv_number

    def edit(self, rcv_number):
        filename = rcv_number + ".pdf"

        old_path = os.path.join(settings.MEDIA_ROOT, rcv_foldername, self.filename)
        new_path = os.path.join(settings.MEDIA_ROOT, rcv_foldername, filename)

        os.rename(old_path, new_path)
        self.filename = filename
        self.rcv_number = rcv_number

        rcv_re = re.compile('(RCV|RECV)(\d{2})(\d{2})(\d{2})-\d{4}')

        re_results = re.search(rcv_re, rcv_number)
        print(re_results)
        if re_results != None:
            year = int('20' + re_results.group(2))
            month = int(re_results.group(3))
            day = int(re_results.group(4))

            d = datetime.date(year, month, day)

            self.rcv_date = d
            self.upload_date = django.utils.timezone.now()
            self.correct_name = True
        self.save()

    def get_filepath(self):
        filepath = os.path.join(settings.MEDIA_ROOT, rcv_foldername, self.filename)
        return filepath

@receiver(pre_delete, sender=RCV)
def delete_file(sender, instance, using, **kwargs):
    try:
        print("Deleting RCV FILE")
        filepath = os.path.join(settings.MEDIA_ROOT, rcv_foldername, instance.filename)
        os.remove(filepath)
    except FileNotFoundError:
        pass
        # super(RCV, self).delete(*args, **kwargs)