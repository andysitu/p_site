from django.db import models
from django.contrib.postgres.fields import ArrayField, HStoreField

class Test(models.Model):
    test_field  = models.CharField(max_length=50)

class GridMap(models.Model):
    empty_image_letter = "e"
    empty_location_letter = ""

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
        self.grid_image[y][x] = box_type
        self.grid_location[y][x] = rack_location

    def create_grids(self):
        self.grid_image = self.make_empty_map(self.width, self.height, self.empty_image_letter)
        self.grid_location = self.make_empty_map(self.width, self.height, self.empty_location_letter)

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

    def add_rack_aisle(self, x, y, vertical, location_sub, start_column, num_racks, decrement):
        for i in range(num_racks):
            if vertical:
                if decrement:
                    rack_location = location_sub + "." + str(start_column - i)
                else:
                    rack_location = location_sub + "." + str(start_column + i)
                self.add_rack_box(x, y + i * 4, vertical, rack_location)
            else:
                if decrement:
                    rack_location = location_sub + "." + str(start_column - i)
                else:
                    rack_location = location_sub + "." + str(start_column + i)
                self.add_rack_box(x + i * 4, y, vertical, rack_location)

    def add_shelf_box(self, x, y, vertical, location,):
        if vertical:
            self.add_box(x,     y,      'st',   location)
            self.add_box(x,     y+1,    'sb',   location)
        else:
            self.add_box(x,     y,      'sl',   location)
            self.add_box(x+1,   y,      'sr',   location)

    def add_shelf_aisle(self, x, y, vertical, location_sub, start_column, num_racks, decrement):

        for i in range(num_racks):
            if vertical:
                if decrement:
                    location = location_sub + "." + str(start_column - i)
                else:
                    location = location_sub + "." + str(start_column + i)
                self.add_shelf_box(x, y + i * 2, vertical, location)
            else:
                if decrement:
                    location = location_sub + "." + str(start_column - i)
                else:
                    location = location_sub + "." + str(start_column + i)
                self.add_shelf_box(x + i * 2, y, vertical, location)