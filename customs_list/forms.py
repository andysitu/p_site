from django import forms
from django.utils.translation import gettext_lazy
from .models import CustomsDeclaration
import datetime
# from django.forms.widgets import HiddenInput

class UploadCustomsDeclaration(forms.Form):
    customs_file = forms.FileField(
        label=gettext_lazy("Select an Customs Declaration PDF File"),
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

    upload_date = forms.DateField(widget=forms.widgets.DateInput(attrs={'type': 'date'}),
                                  initial=datetime.date.today,
                                  label=gettext_lazy("Upload Date"))

class XMLRequestForm(forms.Form):
    command = forms.CharField()
    filename = forms.CharField()

class EditCustomsDeclarationForm(forms.Form):
    customs_number = forms.CharField(initial='1100000',)

    # class Meta:
    #     model = CustomsDeclaration
    #     fields = ['customs_number', 'upload_date',]
    #     widgets = {
    #         'upload_date': DateInput(),
    #     }

    # def __init__(self, *args, **kwargs):
    #     upload_date = kwargs.pop("upload_date")
    #     super(EditCustomsDeclarationForm, self).__init__(*args, **kwargs)
    #     self.fields['upload_date'] = upload_date