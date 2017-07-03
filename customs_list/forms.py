from django import forms
from django.utils.translation import gettext_lazy

class UploadCustomsDeclaration(forms.Form):
    customs_file = forms.FileField(
        label=gettext_lazy("Select an Customs Declaration PDF File"),
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

class XMLRequestForm(forms.Form):
    command = forms.CharField()
    filename = forms.CharField()