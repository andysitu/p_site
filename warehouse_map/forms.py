from django import forms
from django.utils.translation import gettext_lazy
import datetime

class UploadExcelData(forms.Form):
    excel_data_file = forms.FileField(
        label=gettext_lazy("Select an exported excel file from the WMS."),
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

class CompareDates(forms.Form):
    date1 = forms.DateTimeField(widget=forms.widgets.DateTimeInput(attrs={'type': 'date'}),
                                  initial=datetime.date.today,
                                  label=gettext_lazy("First Date"))

    date2 = forms.DateTimeField(widget=forms.widgets.DateTimeInput(attrs={'type': 'date'}),
                            initial=datetime.date.today,
                            label=gettext_lazy("First Date"))

class XMLRequestGridForm(forms.Form):
    loc = forms.CharField()