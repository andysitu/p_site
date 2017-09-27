from django import forms
from django.utils.translation import gettext_lazy

class UploadFile(forms.Form):
    name = forms.CharField(
        required=False,
    )

    file = forms.FileField(
        label=gettext_lazy("Select a File"),
        help_text='',
    )

    note = forms.CharField(
        required=False,
    )