from django.db import models

class Test(models.Model):
    test_field  = models.CharField(max_length=50)

# class GridMap(models.Model):
#     grid_image = ArrayField(
#         ArrayField(
#             models.CharField(max_length=10, blank=True)
#         )
#     )
#     grid_location = ArrayField(
#         ArrayField(
#             models.CharField(max_length=20, blank=True)
#         )
#     )
#
#     def add_box(self, x, y, box_type, rack_location):
#         self.grid_map[x][y] = box_type
#         self.grid_location[x][y] = rack_location