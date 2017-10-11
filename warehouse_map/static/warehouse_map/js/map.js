const BACKGROUND_COLOR = "white";


$( document ).ready(function() {
    // Setup canvas width, heightcanvasMap, etc.
    (function set_canvas() {
        var map_canvas_jobj = $( '#map_canvas' ),
            map_canvas = map_canvas_jobj[0];

        var side_nav_bar_width = $( '#sidebar-nav-div' ).outerWidth(),
            main_navbar_height = $( '#main-navbar' ).outerHeight();

        var canvas_width = $(window).width() - side_nav_bar_width,
            canvas_height = $(window).height() - main_navbar_height -10;

        map_canvas.width = canvas_width;
        map_canvas.height = canvas_height;
    })();

    // Ajax to get grid_map (arrays)
    var loc_list = ['F', 'VC', 'S', 'P',];
    map_ajax.get_map_arr_ajax( loc_list, function(map_data_arr) {
        canvasMap.make_map(map_data_arr);
    });

    // Add Event handlers for sidemenu

    $('#menu-settingButton').on('click', function() {
        $('#menu-setting').addClass('reveal');
        $('.overlay').show();
    });

    $('.overlay').on('click', function() {
        $('#menu-setting').removeClass('reveal');
        $('#menu-screen-container').removeClass('reveal');
        $('.overlay').hide();
    });

    // Click on Delete items by date link
    $( '#date-del-link' ).click(function(e){
        e.preventDefault();
        page_functions.make_menuScreen("delete_date");
        map_ajax.fill_delMenu_date();
        $('#menu-setting').removeClass('reveal');
        $('#menu-screen-container').addClass('reveal');
    });
});

function remove_events() {
    var map_canvas_jobj = $( '#map_canvas' );

    map_canvas_jobj.off("click");
    map_canvas_jobj.off("mouseleave");
    map_canvas_jobj.off("mousemove");

    $("#map-submit-button").off("click");
};

var canvasMap = {
    /* map_data_arr contains array of dictionaries of each maps, which contains:
      box_length, end_x, end_y, loc, num_across, num_down, start_x, start_y,
      color_map, data_map, location_map
    */
    map_data_arr: null,
    map_canvas_jobj: null,
    canvas_width: null,
    canvas_height: null,
    ctx: null,
    max_level: null,
    highlighted: "",
    saved_canvas_img: null,
    make_map: function(map_data_arr, fill_sidemenu_status, level) {
        this.map_data_arr = map_data_arr;
        this.map_canvas_jobj = $('#map_canvas');

        var map_canvas = this.map_canvas_jobj[0],
            i;

        this.canvas_width = map_canvas.width;
        this.canvas_height = map_canvas.height;
        this.ctx = map_canvas.getContext('2d');

        this.clearMap();

        this.max_level = get_max_level(this.map_data_arr);

        // Get total width & length of arrays
        var max_num_down = 0,
            total_num_across = 0,
            data_length = this.map_data_arr.length,
            num_down;

        for (i = 0; i < data_length; i++) {
            map_data_dic = map_data_arr[i];
            num_down = map_data_dic.num_down;

            if (num_down > max_num_down) {
                max_num_down = num_down
            }

            total_num_across += map_data_dic.num_across;
        }

        var box_width = Math.floor((this.canvas_width + 1) / total_num_across),
            box_height = Math.floor((this.canvas_height + 1) / max_num_down),
            box_length;

        box_length = (box_width > box_height) ? box_height : box_width;

        // Add x,y,html info for each data_dictionary
        var start_x = 0, start_y = 0;
        for (i = 0; i < data_length; i++) {
            map_data_dic = this.map_data_arr[i];
            image_map = map_data_dic["image_map"];
            map_info = this.draw_map(this.ctx, image_map, start_x, start_y, box_length,
                map_data_dic["color_map"],
                map_data_dic["location_map"], level);

            map_data_dic["start_x"] = start_x;
            map_data_dic["start_y"] = start_y;
            map_data_dic["end_x"] = map_info["end_x"];
            map_data_dic["end_y"] = map_info["end_y"];
            map_data_dic["box_length"] = box_length;

            start_x = map_info["end_x"];
        }

        this.save_canvas();

        // Add event handler for clicking the search button.
        $("#map-submit-button").click( this.map_search.bind(this) );

        // When entire map is shown
        if (data_length === 4) {
            this.save_canvas()

            this.map_canvas_jobj.mousemove( mouseHandlers.mouse_move_handler.bind(this) );
            this.map_canvas_jobj.mouseleave( mouseHandlers.mouseleave_handler.bind(this) );
            this.map_canvas_jobj.click( mouseHandlers.mouseclick_handler.bind(this) );
            // Showing only one section of map is shown
        } else {
            if (fill_sidemenu_status === true) {
                page_functions.fill_sidemenu(this.max_level);
                side_menu.change_data_type_select();
            }

            this.map_canvas_jobj.click( click_map_for_info.bind(this) );
        }
    },
    map_search: function(e) {
        e.preventDefault();
        map_ajax.map_search(this.map_data_arr);
    },
    clearMap: function() {
        this.ctx.clearRect(0, 0, this.canvas_width, this.canvas_height);
        this.clear_highlight();
        remove_events();
    },
    save_canvas: function() {
        this.saved_canvas_img = this.ctx.getImageData(0, 0,
            this.canvas_width, this.canvas_height);
    },
    restore_canvas: function() {
        this.ctx.putImageData(this.saved_canvas_img, 0, 0);
        this.clear_highlight();
    },
    clear_highlight: function() {
        this.highlighted = "";
        page_functions.write_msg("");
    },
    highlight_map: function(i,x, y) {
        var locations_info_dic = this.get_similar_locations(i, x, y)
            data_dic = this.map_data_arr[i],
            image_map = data_dic["image_map"],
            loc_info_arr = null,
            i, x, y;

        for (location_str in locations_info_dic) {
            loc_info_arr = locations_info_dic[location_str];
            i = loc_info_arr[0];
            x = loc_info_arr[1];
            y = loc_info_arr[2];

            this.highlight_box(i, x, y);
        }
    },
    highlight_box: function(i, x, y) {
        /**
         * Highlights the edges of the boxes
         * i [int]: the index in the map_data_arr to get the dict.
         * x[int], y[int]: the indexes in the maps to get that location.
         */
        var data_dic = this.map_data_arr[i],
            image_key = data_dic["image_map"][y][x],
            loc_start_x = data_dic.start_x,
            loc_start_y = data_dic.start_y,
            ctx = this.ctx,
            box_length = data_dic["box_length"];

        var start_x = loc_start_x + x * box_length,
            start_y = loc_start_y + y * box_length;

        ctx.save();

        ctx.strokeStyle = "red";

        switch(image_key) {
            case "e":
                break;
            case "sl":
                ctx.beginPath();
                ctx.moveTo(start_x+box_length, start_y);
                ctx.lineTo(start_x, start_y);
                ctx.lineTo(start_x, start_y+box_length);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                break;
            case "sr":
                ctx.beginPath();
                ctx.moveTo(start_x, start_y);
                ctx.lineTo(start_x+box_length, start_y);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                ctx.lineTo(start_x, start_y+box_length);
                break;

            case 'st':
                ctx.beginPath();
                ctx.moveTo(start_x, start_y+box_length);
                ctx.lineTo(start_x, start_y);
                ctx.lineTo(start_x+box_length, start_y);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                break;
            case 'sb':
                ctx.beginPath();
                ctx.moveTo(start_x, start_y);
                ctx.lineTo(start_x, start_y+box_length);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                ctx.lineTo(start_x+box_length, start_y);
                break;

            case "rtl":
                ctx.beginPath();
                ctx.moveTo(start_x, start_y+box_length);
                ctx.lineTo(start_x, start_y);
                ctx.lineTo(start_x+box_length, start_y);
                break;
            case "rbl":
                ctx.beginPath();
                ctx.moveTo(start_x, start_y);
                ctx.lineTo(start_x, start_y+box_length);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                break;
            case 'rtr':
                ctx.beginPath();
                ctx.moveTo(start_x, start_y);
                ctx.lineTo(start_x+box_length, start_y);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                break;
            case 'rbr':
                ctx.beginPath();
                ctx.moveTo(start_x+box_length, start_y);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                ctx.lineTo(start_x, start_y+box_length);
                break;

            case 'rt':
                ctx.beginPath();
                ctx.moveTo(start_x, start_y);
                ctx.lineTo(start_x+box_length, start_y);
                break;
            case 'rb':
                ctx.beginPath();
                ctx.moveTo(start_x, start_y+box_length);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                break;
            case 'rr':
                ctx.beginPath();
                ctx.moveTo(start_x+box_length, start_y);
                ctx.lineTo(start_x+box_length, start_y+box_length);
                break;
            case 'rl':
                ctx.beginPath();
                ctx.moveTo(start_x, start_y);
                ctx.lineTo(start_x, start_y+box_length);
                break;
        }
        ctx.stroke();
        ctx.restore();
    },
    get_similar_locations: function(i, x, y, location, loc_dic) {
        var data_arr = this.map_data_arr,
            data_dic = data_arr[i],
            location_map = data_dic["location_map"],
            cur_loc = location_map[y][x],
            key_loc = String(i) + "_" + String(x) + "_" + String(y);


        if (location === undefined) {
            location = cur_loc;
        }
        if (loc_dic === undefined) {
            loc_dic = {};
        }
        if (key_loc in loc_dic) {
            return 0;
        }

        if (cur_loc == location) {
            loc_dic[ key_loc ] = [i,x,y];

            // left
            if (x-1 >= 0) {
                this.get_similar_locations(i, x-1, y, location, loc_dic);
            }
            //right
            var right_y_len = location_map[y].length;
            if (x+1 < right_y_len) {
                this.get_similar_locations(i, x+1, y, location, loc_dic);
            }
            //up
            if (y - 1 >= 0) {
                this.get_similar_locations(i, x, y-1, location, loc_dic);
            }
            //down
            var down_len = location_map.length;
            if (y + 1 < down_len) {
                this.get_similar_locations(i, x, y+1, location, loc_dic);
            }
        }

        return loc_dic;
    },
    draw_map: function(ctx, image_map, start_x, start_y, box_length, color_map, location_map, level){
        var i, j,
            map_key,
            image_map_length = image_map.length,
            color, location,
            blank_rack_color = "rgb(102, 102, 153)";

        for (i=0; i < image_map_length; i++) {
            var sub_arr_len = image_map[i].length;
            for (j = 0; j < image_map[i].length; j++) {
                map_key = image_map[i][j];
                x = start_x + box_length * j;
                y = start_y + box_length * i;

                location = location_map[i][j];
                if (location == '')
                    continue;

                if ( ! map_functions.proc_level_from_location(location, level))
                    continue;

                if (typeof(color_map) !== "undefined") {

                    if (location in color_map)
                        color = color_map[location];
                    else
                        color = blank_rack_color;
                } else {
                    color = blank_rack_color;
                }
                draw_box(ctx, x, y, box_length, box_length, map_key, color);
            }
        }

        return {
            "end_x": x + box_length,
            "end_y": y + box_length,
        }
    },

};

function click_map_for_info(e) {
    var map_index_arr = get_map_index_by_xy(e, this.map_data_arr);

    this.restore_canvas();

    if (map_index_arr === 0)
        return 0;

    var i = map_index_arr[0],
        x = map_index_arr[1],
        y = map_index_arr[2];

    var map_data_dic = this.map_data_arr[i];

    location_map = map_data_dic["location_map"];

    if (typeof location_map[y] !== 'undefined') {
        var location = location_map[y][x];
        if (location !== '' && typeof location !== 'undefined') {
            if (typeof map_data_dic["data_map"] !== "undefined" ) {
                var data = map_data_dic["data_map"][location];
                page_functions.display_loc_info(location, data);
            } else {
                page_functions.display_loc_info(location);
            }
            this.highlight_map(i, x, y);
        } else {
            this.restore_canvas();
        }
    }
}

function get_map_index_by_xy(e, map_data_arr) {
    /**
     * Uses the map_data_arr in outerscope.
     * Return
     * i [int]: (representing index in map_data_arr
     *   to get map_data_dict),
     * x[int], y[int]: use in [y][x] format in location map
     *   or other maps.
     */
    var offset_y = e.offsetY,
        offset_x = e.offsetX,
        i, box_length,
        data_length = map_data_arr.length;

    for (i = 0; i < data_length; i++) {
        map_data_dic = map_data_arr[i];
        box_length = map_data_dic.box_length;
        if (offset_x >= map_data_dic.start_x && offset_x <= map_data_dic.end_x &&
            offset_y >= map_data_dic.start_y && offset_y <= map_data_dic.end_y) {
            location_map = map_data_dic["location_map"];
            var y = Math.floor((offset_y - map_data_dic.start_y ) / box_length),
                x = Math.floor((offset_x - map_data_dic.start_x ) / box_length);

            return [i, x, y];
        }
    }
    return 0;
}

function draw_box(ctx, x, y, width, height, map_key, color) {
    ctx.strokeStyle = "black";
    ctx.fillStyle = color;
    if (map_key != "e") {
        original_color = ctx.fillStyle;
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = original_color;
    }
    switch(map_key) {
        case "e":
            break;
        case "sl":
            ctx.fillRect(x+1, y+1, width-1, height-2);
            break;
        case "sr":
            ctx.fillRect(x, y+1, width-1, height-2);
            break;

        case 'st':
            ctx.fillRect(x+1, y+1, width-2, height-1);
            break;
        case 'sb':
            ctx.fillRect(x+1, y, width-2, height-1);
            break;

        case "rtl":
            ctx.fillRect(x+1, y+1, width-1, height-1);
            break;
        case "rbl":
            ctx.fillRect(x+1, y, width-1, height-1);
            break;
        case 'rtr':
            ctx.fillRect(x, y+1, width-1, height-1);
            break;
        case 'rbr':
            ctx.fillRect(x, y, width-1, height-1);
            break;

        case 'rt':
            ctx.fillRect(x, y+1, width, height-1);
            break;
        case 'rb':
            ctx.fillRect(x, y, width, height-1);
            break;
        case 'rr':
            ctx.fillRect(x,y, width-1, height);
            break;
        case 'rl':
            ctx.fillRect(x+1, y, width-1, height);
            break;
    }
};

function get_max_level(map_data_arr) {
    var max_level = 0,
        i,
        map_data_len = map_data_arr.length,
        loc;

    for (i = 0; i < map_data_len; i++) {
        var level;

        loc = map_data_arr[i]["loc"];

        switch(loc) {
            case "S":
                level = 6;
                break;
            case "F":
                level = 4;
                break;
            case "P":
                level = 3;
                break;
            case "VC":
                level = 5;
                break;
        };
        if (level > max_level)
            max_level = level;
    }

    return max_level;
};