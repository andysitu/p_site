from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

from django.contrib.auth.decorators import login_required

def view_day(request):
    return render(
        request,
        "uploader/view_fiew.html",
        {}
    )