from django.db import models
from datetime import datetime
from pytz import timezone

# Create your models here.
class TrackingType(models.Model):
    name = models.CharField(max_length=50)

    @classmethod
    def get_types(cls):
        # Returns dictionary with k/v being string name of type / id.
        types = {}
        types_q = cls.objects.all()
        for type_o in types_q:
            types[type_o.name] = type_o.id
        return types


class Tracking_Number(models.Model):
    number = models.CharField(max_length=25)
    input_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    receive_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    tracking_type =  models.ForeignKey(TrackingType, on_delete=models.CASCADE, blank=True, null=True)
    note = models.TextField()

    @classmethod
    def create(cls, tracking_info_dic):
        tracking_num = tracking_info_dic["tracking_number"]
        tracking_type_id = tracking_info_dic["tracking_type_id"]
        typeName = tracking_info_dic["typeName"]
        note = tracking_info_dic["note"]

        try:
            tracking_type = TrackingType.objects.get(id = tracking_type_id)
        except TrackingType.DoesNotExist as e:
            tracking_type = TrackingType(name = typeName)
            tracking_type.save()
        
        tracking_num_obj = cls(number=tracking_num, tracking_type=tracking_type,
                            note=note)
        tracking_num_obj.save()
        return tracking_num_obj.get_data_obj()

    def get_data_obj(self):
        # Creates dict of the data.
        o = {}
        o["id"] = self.pk

        input_date = self.input_date.astimezone(timezone('America/Los_Angeles'))
        inputDate_string = input_date.strftime("%Y-%m-%d %H:%M:%S %Z")
        receive_date = self.receive_date.astimezone(timezone('America/Los_Angeles'))
        receiveDate_string = receive_date.strftime("%Y-%m-%d %H:%M:%S %Z")

        o["tracking_number"] = self.number
        o["typeName"] = self.tracking_type.name
        o["typeId"] = self.tracking_type.pk
        o["receive_date"] = receiveDate_string
        o["input_date"] = inputDate_string
        return o
    
    @classmethod
    def get_data(cls):
        data = {}
        tracking_objs = cls.objects.all()
        for obj in tracking_objs:
            data[obj.id] = obj.get_data_obj()
        return data

    @classmethod
    def delete_by_id(cls, o_id):
        trackNumObj = cls.objects.get(id=o_id)        
        trackNumObj.delete()
        return o_id