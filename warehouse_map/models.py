from django.db import models
from django.contrib.postgres.fields import ArrayField, HStoreField

class Test(models.Model):
    test_field  = models.CharField(max_length=50)

class GridMap(models.Model):
    loc = models.CharField(max_length=10)
    width = models.IntegerField()
    height = models.IntegerField()
    grid_image = ArrayField(
        ArrayField(
            models.CharField(max_length=10, blank=True)
        ),
        default=[[],]
    )
    grid_location = ArrayField(
        ArrayField(
            models.CharField(max_length=20, blank=True)
        ),
        default=[[],]
    )

    def add_box(self, x, y, box_type, rack_location):
        self.grid_map[y][x] = box_type
        self.grid_location[y][x] = rack_location

    def create_grids(self, width, height):
        self.grid_image = self.make_empty_map(width, height, "e")
        self.grid_location = self.make_empty_map(width, height, "")

    def make_empty_map(self, width, height, empty_symbol,):
        # e_map = [ [empty_symbol] * width ] * height
        e_map = []
        for h in range(height):
            e_map.append([empty_symbol] * width)

        return e_map

    def add_rack_box(self, x, y, vertical, rack_location,):
        if vertical:
            self.add_box(x,     y,      'rtl',  rack_location)
            self.add_box(x+1,   y,      'rtr',  rack_location)
            self.add_box(x,     y+1,    'rl',   rack_location)
            self.add_box(x+1,   y+1,    'rr',   rack_location)
            self.add_box(x,     y+2,    'rl',   rack_location)
            self.add_box(x+1,   y+2,    'rr',   rack_location)
            self.add_box(x,     y+3,    'rbl',  rack_location)
            self.add_box(x+1,   y+3,    'rbr',  rack_location)
        else:
            self.add_box(x,     y,      'rtl',  rack_location)
            self.add_box(x+1,   y,      'rt',   rack_location)
            self.add_box(x+2,   y,      'rt',   rack_location)
            self.add_box(x+3,   y,      'rtr',  rack_location)
            self.add_box(x,     y+1,    'rbl',  rack_location)
            self.add_box(x+1,   y+1,    'rb',   rack_location)
            self.add_box(x+2,   y+1,    'rb',   rack_location)
            self.add_box(x+3,   y+1,    'rbr',  rack_location)

    def add_rack_aisle(self, x, y, vertical, location_sub, start_column, num_racks,):
        for i in range(num_racks):
            if vertical:
                rack_location = location_sub + "." + str(start_column - i)
                add_rack_box(x, y + i * 4, image_map, vertical, rack_location)
            else:
                rack_location = location_sub + "." + str(start_column + i)
                add_rack_box(x + i * 4, y, image_map, vertical, rack_location)