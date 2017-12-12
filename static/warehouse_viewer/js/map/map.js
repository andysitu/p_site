var map_processor = {
    map_canvas_id: "map-canvas",
    map_data: null,
    canvas_width: null,
    canvas_height: null,
    ctx: null,
    map_canvas: null,

    box_length: 5,
    color_map: null,
    image_map: null,
    location_map: null,

    start: function(data_type, data, form_data) {
        // Create & add canvas element & ctx
        this.map_data = data;

        var loc = form_data["loc"],
            $display_container = viewer.get_$display_container();

        var map_canvas = this.create_canvas();
        this.set_map_processor(map_canvas);

        this.ctx = map_canvas.getContext('2d');

        map_processor.color_map = color_map_functions.mapify(data_type, data);

        this.create_canvas_map(loc);
   },
    create_canvas: function() {
        var $canvas = $("<canvas>", {
                id: this.map_canvas_id,
            }),
            map_canvas = $canvas[0];

        var main_navbar_height = $("#" + element_ids.main_navbar_id).outerHeight(),
            side_menu_width = $("#" + element_ids.sidebar_nav_id).outerWidth();

        var canvas_width = $(window).width() - side_menu_width - 15,
            canvas_height = $(window).height() - main_navbar_height - 15;

        map_canvas.width = canvas_width;
        map_canvas.height = canvas_height;

        return $canvas[0];
    },
    set_map_processor: function(map_canvas) {
        /**
         * Sets the values in map processor obj.
         */
        this.map_canvas = map_canvas;
        $display_container.append(this.map_canvas);
        this.canvas_width = this.map_canvas.width;
        this.canvas_height = this.map_canvas.height;
    },
    create_canvas_map: function(loc) {
        // Get grid_map

        $.ajax({
            url: get_grid_ajax_url,
            datatype: "GET",
            data: {
                "loc[]": [loc],
            },
            success: function(grid_data_arr) {
                var grid_data = grid_data_arr[0];

                var color_map = map_processor.color_map,
                    image_map = grid_data["image_map"],
                    location_map = grid_data["location_map"],
                    num_across = grid_data["num_across"],
                    num_down = grid_data["num_down"],

                    i, j,
                    x, y,
                    location,
                    image_map_length = image_map.length,
                    blank_rack_color = "rgb(102, 102, 153)";

                map_processor.image_map = image_map;
                map_processor.location_map = location_map;

                var box_width = Math.floor((map_processor.canvas_width + 1) / num_across),
                    box_height = Math.floor((map_processor.canvas_height + 1) / num_down),
                    box_length;

                box_length = (box_width > box_height) ? box_height: box_width;
                map_processor.box_length = box_length;

                for (i = 0; i < image_map_length; i++) {
                    var sub_image_map_len = image_map[i].length;

                    for (j = 0; j < sub_image_map_len; j++) {
                        map_key = image_map[i][j];
                        x = box_length * j;
                        y = box_length * i;

                        location = location_map[i][j];

                        if (location == "")
                            continue;

                        // // Checks whether that level exists
                        // if ( ! map_functions.proc_level_from_location(location, level))
                        //     continue;

                        if (location in color_map)
                            color = color_map[location];
                        else
                            color = blank_rack_color;

                        map_processor.draw_box(x, y, box_length, box_length, map_key, color);
                }
            }
            },
        });
    },

    draw_box: function(x, y, width, height, map_key, color) {
        var ctx = map_processor.ctx;

        ctx.strokeStyle = "black";
        ctx.fillStyle = color;
        if (map_key != "e") {
            original_color = ctx.fillStyle;
            ctx.fillStyle = "black";
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = original_color;
        }
        switch (map_key) {
            case "e":
                break;
            case "sl":
                ctx.fillRect(x + 1, y + 1, width - 1, height - 2);
                break;
            case "sr":
                ctx.fillRect(x, y + 1, width - 1, height - 2);
                break;

            case 'st':
                ctx.fillRect(x + 1, y + 1, width - 2, height - 1);
                break;
            case 'sb':
                ctx.fillRect(x + 1, y, width - 2, height - 1);
                break;

            case "rtl":
                ctx.fillRect(x + 1, y + 1, width - 1, height - 1);
                break;
            case "rbl":
                ctx.fillRect(x + 1, y, width - 1, height - 1);
                break;
            case 'rtr':
                ctx.fillRect(x, y + 1, width - 1, height - 1);
                break;
            case 'rbr':
                ctx.fillRect(x, y, width - 1, height - 1);
                break;

            case 'rt':
                ctx.fillRect(x, y + 1, width, height - 1);
                break;
            case 'rb':
                ctx.fillRect(x, y, width, height - 1);
                break;
            case 'rr':
                ctx.fillRect(x, y, width - 1, height);
                break;
            case 'rl':
                ctx.fillRect(x + 1, y, width - 1, height);
                break;
        }
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

        return color_map;
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