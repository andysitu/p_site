from django import forms
from django.utils.translation import gettext_lazy

class UploadFile(forms.Form):
    file = forms.FileField(
        label=gettext_lazy("Select a File"),
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

    note = forms.CharField()