var map_processor = {
    map_canvas_id: "map-canvas",
    map_data: null,
    canvas_width: null,
    canvas_height: null,
    ctx: null,
    map_canvas: null,

    start: function(data_type, data, form_data) {
        // Create & add canvas element & ctx
        var loc = form_data["loc"],
            $display_container = viewer.get_$display_container();

        this.map_canvas = this.add_canvas();
        $display_container.append(this.map_canvas);
        this.canvas_width = this.map_canvas.width;
        this.canvas_height = this.map_canvas.height;

        var color_map = color_map_functions.mapify(data_type, data);

        imageMap_obj.imageMap_ajax(loc);
   },
    add_canvas: function() {
        var $canvas = $("<canvas>", {
                id: this.map_canvas_id,
            }),
            map_canvas = $canvas[0];

        var main_navbar_height = $("#" + element_ids.main_navbar_id).outerHeight(),
            side_menu_width = $("#" + element_ids.sidebar_nav_id).outerWidth();

        console.log(main_navbar_height, side_menu_width);

        var canvas_width = $(window).width() - side_menu_width - 15,
            canvas_height = $(window).height() - main_navbar_height - 15;

        map_canvas.width = canvas_width;
        map_canvas.height = canvas_height;

        return $canvas[0];
    },
    draw_map: function() {

    },
};

var map_ctx_obj = {
};

var imageMap_obj = {
    imageMap_ajax: function(loc, callback_function) {
        $.ajax({
            url: get_grid_ajax_url,
            datatype: "GET",
            data: {
                "loc[]": [loc],
            },
            success: function(data) {
                console.log(data);
            }
        });
    },
};

var color_map_functions = {
    mapify: function(data_type, data) {
        /**
         * Create a dictionary consisting of location as key &
         *  the rgb value as the value,
         */
        if (data_type == "item_count") {
            color_map = this.item_count_map(data);
        }

        console.log(color_map);
    },
    item_count_map: function(data_map) {
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