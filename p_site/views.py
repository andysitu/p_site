from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

from django.utils import translation

def index(request):
    return render(
        request,
        'p_site/index.html')

def setlanguage(request, language):
    if language == "zh-cn" or language == "en":
        user_language = language
        translation.activate(user_language)
        request.session[translation.LANGUAGE_SESSION_KEY] = user_language
    next = request.POST.get('next', '/')
    return HttpResponseRedirect(next)

