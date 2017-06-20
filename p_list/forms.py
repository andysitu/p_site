from django import forms

class UploadRCV(forms.Form):
    # title = forms.CharField(max_length=50)
    rcvfile = forms.FileField(
        label="Select an RCV PDF File",
        help_text='',
        widget=forms.ClearableFileInput(attrs={'multiple': True}),
    )

class XMLRequestForm(forms.Form):
    command = forms.CharField()
    rcv_filename = forms.CharField()