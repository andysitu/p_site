from django.shortcuts import render
from django.http import HttpResponse
from django.core import serializers
from .models import Test

from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder

class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, YourCustomType):
            return force_text(obj)
        return super(LazyEncoder, self).default(obj)

def test(request):
    return HttpResponse("HELLO")

def view_map(request):
    test_dic = {'fire': 'ball'}

    json_data = serializers.serialize('json', Test.objects.all(), cls=LazyEncoder)

    return render(
        request,
        'warehouse_map/map.html',
        context={
            'data_dic': json_data,
        }
    )

def upload_excel_data(request):
    return render(
        request,
        'warehouse_map/upload_excel_data.html',
        context={
        }
    )