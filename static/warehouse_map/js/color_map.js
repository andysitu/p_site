var color_map_functions = {
    // Creates color_map [arr][arr]
    make_color_map: function(data_type, data_map) {
        var color_map = {};

        if (data_type == "Item Count"){
            color_map = this.item_count_map(data_map);
        } else if (data_type == "Items Shipped" || data_type == "Items Added") {
            color_map = this.item_count_map(data_map);
        }

        return color_map;
    },

    item_count_map: function(data_map, r, g, b) {
    /*
        Two parts to function.
        Part 1 creates a dictionary containing location as the key
          with a number associated as value.
        Part 2 uses this dictionary to create a gradient based
          on the number values.
     */
        var color_map = {},
            rack_loc= null,
            item_sku = null,
            max_num = 0,
            total,
            max_dic = {},
            percent = 0;

        var re = /(\w+\.\w+)\./;

        // Part 1, Creating dictionary
        //  { [location]: [total], }
        for (rack_loc in data_map) {
            loc_code = re.exec(rack_loc)[0];
            total = data_map[rack_loc]["total"];
            if (!(loc_code in max_dic)) {
                max_dic[loc_code] = total;
            }
            else if (total > max_dic[loc_code]) {
                max_dic[loc_code] = total;
            }
            color_map[rack_loc] = total;
        }

        // Part 2, Change dictionary created prev.
        //  to reflect a color gradient based on the absolute
        //  maximum (needs to be changed later).
        for (rack_loc in color_map) {
            loc_code = re.exec(rack_loc)[0];
            max_num = max_dic[loc_code];
            percent = color_map[rack_loc] / max_num;

            // Done so that percent will always be greater
            // than 0.
            percent = 1 - percent - .02;
            percent = (percent < 0) ? 0 : percent;

            var rgb_arr = this.hslToRgb(.3333333333333, 1, percent);

            var rgb_str = 'rgb(' + rgb_arr[0] + ',' + rgb_arr[1] + ',' + rgb_arr[2] + ')';
            color_map[rack_loc] = rgb_str;
        }

        return color_map;
    },

    hslToRgb: function(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
};