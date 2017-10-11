var map_functions = {
    make_maxLevel_map: function(location_map) {
        var y, x,
            y_len = location_map.length,
            x_len = location_map[0].length;
        for (y = 0; y < y_len; y++) {
            for (x = 0; x < x_len; x++) {

            }
        }
    },

    proc_level_from_location: function(location, level_str) {
        /**
         * Input: locaation[string], level[string]
         * Returns boolean on whether that location exists
         *   at that level.
         */
        if (level_str == 'All' || level_str == undefined)
            return true;

        var re = /(\w+)\.(\w+)\.(\w+)\.(\w+)/;

        var re_results = re.exec(location),
            area = re_results[2],
            aisle = parseInt(re_results[3]),
            column = parseInt(re_results[4]),
            level = parseInt(level_str);

        if (area == "S") {
            if (aisle >= 27 && aisle <= 42)
                if (level == 6)
                    return false;
        } else if (area == "VA") {
            if (aisle == 44 && level > 3)
                return false;
            else if (column == 13 && level == 2) {
                return false;
                }
        } else if (area == "H") {
            if (level > 3)
                return false;
        } else if (area == "F") {
        }
        return true;
    }
};

var mouseHandlers = {
    mouse_move_handler: function(e) {
        var clicked_y = e.offsetY,
            clicked_x = e.offsetX,
            i, box_length,
            data_length = this.map_data_arr.length;

        for (i = 0; i < data_length; i++) {
            map_data_dic = this.map_data_arr[i];
            box_length = map_data_dic.box_length;
            if (clicked_x >= map_data_dic.start_x && clicked_x <= map_data_dic.end_x &&
                clicked_y >= map_data_dic.start_y && clicked_y <= map_data_dic.end_y) {
                if (this.highlighted == map_data_dic.loc) {
                    return 1;
                }
                this.ctx.save()
                this.ctx.fillStyle = 'rgba(204,229,255,0.5)';
                this.restore_canvas();
                this.ctx.fillRect(map_data_dic.start_x, map_data_dic.start_y,
                    map_data_dic.end_x - map_data_dic.start_x,
                    map_data_dic.end_y - map_data_dic.start_y);
                this.ctx.restore()
                this.highlighted = map_data_dic.loc;
                return 1;
            }
        }
        if (this.highlighted !== '') {
            this.restore_canvas();
        }
    },
    mouseleave_handler: function(e) {
        this.restore_canvas();
    },

    mouseclick_handler: function(e) {
        // Click on map with all locations
        // will focus onto that area by creating new map.
        var clicked_y = e.offsetY,
            clicked_x = e.offsetX,
            i, box_length,
            data_length = this.map_data_arr.length;

        for (i = 0; i < data_length; i++) {
            map_data_dic = this.map_data_arr[i];
            box_length = map_data_dic.box_length;
            if (clicked_x >= map_data_dic.start_x && clicked_x <= map_data_dic.end_x &&
                clicked_y >= map_data_dic.start_y && clicked_y <= map_data_dic.end_y) {
                loc = map_data_dic.loc;

                // function is the callback function for get_map_arr_ajax,
                // with map_data_arr being the argument passed onto it.
                map_ajax.get_map_arr_ajax([loc,], function (map_data_arr) {
                    canvasMap.make_map(map_data_arr, true);
                });
                return 1;
            }
        }
    },
}