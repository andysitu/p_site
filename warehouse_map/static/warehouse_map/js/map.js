const BACKGROUND_COLOR = "white";

function get_map_arr_ajax(location_arr, callback_funct) {
    /*
        Function that will use ajax to receive an array containing
        grid_data from each location called by location_arr and will
        run a callback_function on each location.
     */
    $.ajax({
        url: request_grid_url,
        data: {
            "loc[]": location_arr,
        },
        dataType: "json",
        success: function(map_data_arr) {
            callback_funct(map_data_arr);
        },
    });
};

$( document ).ready(function() {
    // Setup canvas width, height, etc.
    (function set_canvas() {
        var map_canvas_jobj = $( '#map_canvas' ),
            map_canvas = map_canvas_jobj[0];

        side_nav_bar_width = $( '#sidebar-nav-div' ).outerWidth();

        var canvas_width = $(window).width() - side_nav_bar_width,
            canvas_height = $(window).height() - 50;

        map_canvas.width = canvas_width;
        map_canvas.height = canvas_height;
    })();

    // Ajax to get grid_map (arrays)
    var loc_list = ['F', 'VC', 'S', 'P',];
    get_map_arr_ajax( loc_list, function(map_data_arr) {
            make_map(map_data_arr);
        }
    );
});

function remove_events() {
    var map_canvas_jobj = $( '#map_canvas' );

    map_canvas_jobj.off("click");
    map_canvas_jobj.off("mouseleave");
    map_canvas_jobj.off("mousemove");

    $("#map-submit-button").off("click");
};

function make_map(map_data_arr, fill_sidemenu_status) {
    var map_canvas_jobj = $( '#map_canvas' ),
        map_canvas = map_canvas_jobj[0],
        i,
        canvas_width = map_canvas.width,
        canvas_height = map_canvas.height,

        ctx = map_canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas_width, canvas_height);
    remove_events();

    var max_level = get_max_level(map_data_arr);

    // Get total width & length of arrays
    var max_num_down = 0,
        total_num_across = 0,
        data_length = map_data_arr.length,
        num_down;
    for ( i = 0; i < data_length; i++) {
        map_data_dic = map_data_arr[i];
        num_down = map_data_dic.num_down;

        if (num_down > max_num_down) {
            max_num_down = num_down
        }

        total_num_across += map_data_dic.num_across;
    }

    var box_width = Math.floor((canvas_width+ 1)/ total_num_across),
        box_height = Math.floor((canvas_height + 1)/ max_num_down),
        box_length;

    box_length = (box_width > box_height) ? box_height : box_width;

    // Add x,y,html info for each data_dictionary
    var start_x =0, start_y = 0;
    for ( i = 0; i < data_length; i++) {
        map_data_dic = map_data_arr[i];
        image_map = map_data_dic["image_map"];
        map_info = draw_map(ctx, image_map, start_x, start_y, box_length,
                            map_data_dic["color_map"],
                            map_data_dic["location_map"]);

        map_data_dic["start_x"] = start_x;
        map_data_dic["start_y"] = start_y;
        map_data_dic["end_x"] = map_info["end_x"];
        map_data_dic["end_y"] = map_info["end_y"];
        map_data_dic["box_length"] = box_length;

        start_x = map_info["end_x"];
    }

    // Clicking the search button.
    $("#map-submit-button").click(function(e){
        e.preventDefault();
        map_search(map_data_arr);
    });

    function get_map_index_by_xy(e) {
        var offset_y = e.offsetY,
            offset_x = e.offsetX,
            i, box_length;

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

    function click_map_for_info(e) {
        var map_index_arr = get_map_index_by_xy(e);

        if (map_index_arr === 0)
            return 0;

        var i = map_index_arr[0],
            x = map_index_arr[1],
            y = map_index_arr[2];

        var map_data_dic = map_data_arr[i];

        location_map = map_data_dic["location_map"];

        if (typeof location_map[y] !== 'undefined') {
            var location = location_map[y][x];
            if (location !== '' && typeof location !== 'undefined') {
                if (typeof map_data_dic["data_map"] !== "undefined" ) {
                    var data = map_data_dic["data_map"][location];
                    console.log(location, data);
                } else {
                    console.log(location);
                }
            }
        }
    }

    // Showing all locations
    if (data_length === 4) {
        var highlighted = "";
        orig_image = ctx.getImageData(0, 0, canvas_width, canvas_height);

        function restore_canvas(){
            ctx.putImageData(orig_image, 0, 0);
            highlighted = '';
        };

        map_canvas_jobj.mousemove(function(e) {
            var clicked_y = e.offsetY,
                clicked_x = e.offsetX,
                i, box_length;

            for (i = 0; i < data_length; i++) {
                map_data_dic = map_data_arr[i];
                box_length = map_data_dic.box_length;
                if( clicked_x >= map_data_dic.start_x && clicked_x <= map_data_dic.end_x &&
                    clicked_y >= map_data_dic.start_y && clicked_y <= map_data_dic.end_y )
                {
                    if (highlighted == map_data_dic.loc) {
                        return 1;
                    }
                    ctx.save()
                    ctx.fillStyle = 'rgba(204,229,255,0.5)';
                    restore_canvas();
                    ctx.fillRect(map_data_dic.start_x, map_data_dic.start_y,
                                map_data_dic.end_x - map_data_dic.start_x,
                                map_data_dic.end_y - map_data_dic.start_y);
                    ctx.restore()
                    highlighted = map_data_dic.loc;
                    return 1;
                }
            }
            if (highlighted !== '') {
                restore_canvas();
            }
        });
        map_canvas_jobj.mouseleave(function(e){
            restore_canvas();
        });
        map_canvas_jobj.click(function(e){
            // Click on map with all locations
            // will focus onto that area by creating new map.
            var clicked_y = e.offsetY,
                clicked_x = e.offsetX,
                i, box_length;

            for (i = 0; i < data_length; i++) {
                map_data_dic = map_data_arr[i];
                box_length = map_data_dic.box_length;
                if( clicked_x >= map_data_dic.start_x && clicked_x <= map_data_dic.end_x &&
                    clicked_y >= map_data_dic.start_y && clicked_y <= map_data_dic.end_y )
                {
                    loc = map_data_dic.loc;

                    // function is the callback function for get_map_arr_ajax,
                    // with map_data_arr being the argument passed onto it.
                    get_map_arr_ajax( [loc,] , function(map_data_arr){
                        make_map(map_data_arr, true);
                    });
                    return 1;
                }
            }
        });
    // Showing only one section
    } else {
        if (fill_sidemenu_status === true) {
            fill_sidemenu(max_level);
        }

        map_canvas_jobj.click( click_map_for_info );
    }
}

function fill_sidemenu(max_level) {
    $('#data-type-select').empty();
    $('#level-select').empty();
    $('#date-select').empty();
    $('#date-select-2').empty();

    set_level_input(max_level);
    set_data_type();
    set_date_input()
    change_data_type_select()
}

function draw_map(ctx, image_map, start_x, start_y, box_length, color_map, location_map){
    var i, j,
        map_key,
        image_map_length = image_map.length,
        color, location;

    for (i=0; i < image_map_length; i++) {
        var sub_arr_len = image_map[i].length;
        for (j = 0; j < image_map[i].length; j++) {
            map_key = image_map[i][j];
            x = start_x + box_length * j;
            y = start_y + box_length * i;

            if (typeof(color_map) !== "undefined") {
                location = location_map[i][j];
                if (location in color_map)
                    color = color_map[location];
                else
                    color = "white";
            } else {
                color = "white";
            }
            draw_box(ctx, x, y, box_length, box_length, map_key, color);
        }
    }

    return {
        "end_x": x + box_length,
        "end_y": y + box_length,
    }
};

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