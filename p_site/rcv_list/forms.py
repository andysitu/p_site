from django import forms
from django.utils.translation import gettext_lazy

import datetime

class UploadRCV(forms.Form):
    rcvfile = forms.FileField(
        label=gettext_lazy("Select an RCV PDF File"),
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

class UploadRCVs(forms.Form):
    rcv_batchfile = forms.FileField(
        label=gettext_lazy("Select an RCV PDF File"),
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

    d = datetime.date.today()
    datetoday_string = d.isoformat()

    input_date = forms.DateField(widget=forms.widgets.DateInput(attrs={'type': 'date'}),
                                  initial=datetoday_string,
                                  label=gettext_lazy("Input Date"))

    input_date_status = forms.BooleanField(
        label=gettext_lazy("Input Date"),
        initial=True,
        required=False,
    )

class XMLRequestForm(forms.Form):
    command = forms.CharField()
    rcv_filename = forms.CharField()

class EditRCVName(forms.Form):
    rcv_number = forms.CharField()

class SearchRCV(forms.Form):
    rcv_name = forms.CharField()