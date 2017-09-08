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
            if (aisle == 44)
                if (level > 3)
                    return false;
            else if (level > 4)
                return false;
        } else if (area == "H") {
            if (level > 3)
                return false;
        } else if (area == "F") {
            if (aisle > 1) {
                if (column == 13 && level <= 2)
                    return false;
            }
        }
        return true;
    }
};

