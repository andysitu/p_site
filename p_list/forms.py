from django import forms
from django.utils.translation import gettext_lazy

class UploadRCV(forms.Form):
    rcvfile = forms.FileField(
        label=gettext_lazy("Select an RCV PDF File"),
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

class XMLRequestForm(forms.Form):
    command = forms.CharField()
    rcv_filename = forms.CharField()