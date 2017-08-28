const BACKGROUND_COLOR = "white";

function ajax_map(location_arr, callback_funct) {
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
    ajax_map(loc_list, function(map_data_arr) {
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

function make_map(map_data_arr, loc) {
    var map_canvas_jobj = $( '#map_canvas' ),
        map_canvas = map_canvas_jobj[0],
        i,
        canvas_width = map_canvas.width,
        canvas_height = map_canvas.height,

        ctx = map_canvas.getContext('2d'),
        max_level = null;

    max_level = get_max_level(loc);

    ctx.clearRect(0, 0, canvas_width, canvas_height);
    remove_events();

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

    var start_x =0, start_y = 0;
    for ( i = 0; i < data_length; i++) {
        map_data_dic = map_data_arr[i];
        image_map = map_data_dic["image_map"];
        map_info = draw_map(ctx, image_map, start_x, start_y, box_length);

        map_data_dic["start_x"] = start_x;
        map_data_dic["start_y"] = start_y;
        map_data_dic["end_x"] = map_info["end_x"];
        map_data_dic["end_y"] = map_info["end_y"];
        map_data_dic["box_length"] = box_length;

        start_x = map_info["end_x"];
    }

    $("#map-submit-button").click(function(e){
        e.preventDefault();
        map_search(map_data_arr);
    });

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
                    clicked_y >= map_data_dic.start_y && clicked_y <= map_data_dic.end_y
                    )
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
            var clicked_y = e.offsetY,
                clicked_x = e.offsetX,
                i, box_length;

            for (i = 0; i < data_length; i++) {
                map_data_dic = map_data_arr[i];
                box_length = map_data_dic.box_length;
                if( clicked_x >= map_data_dic.start_x && clicked_x <= map_data_dic.end_x &&
                    clicked_y >= map_data_dic.start_y && clicked_y <= map_data_dic.end_y
                    )
                {
                    loc = map_data_dic.loc;

                    ajax_map( [loc,] , function(map_data_arr){
                        make_map(map_data_arr, loc);
                    });
                    return 1;
                }
            }
        });
    // Showing only one section
    } else {
        set_level_input(max_level);
        set_data_type();
        set_date_input()
        change_data_type_select()

        map_canvas_jobj.click(function(e){
            var clicked_y = e.offsetY,
                clicked_x = e.offsetX,
                i, box_length;

            for (i = 0; i < data_length; i++) {
                map_data_dic = map_data_arr[i];
                box_length = map_data_dic.box_length;
                if( clicked_x >= map_data_dic.start_x && clicked_x <= map_data_dic.end_x &&
                    clicked_y >= map_data_dic.start_y && clicked_y <= map_data_dic.end_y)
                {
                    location_map = map_data_dic["location_map"];
                    var y = Math.floor( (clicked_y - map_data_dic.start_y )/ box_length),
                        x = Math.floor( (clicked_x - map_data_dic.start_x ) / box_length);

                    if (typeof location_map[y] !== 'undefined') {
                        if (typeof location_map[y][x] !== 'undefined') {
                            console.log(location_map[y][x], x, y, clicked_x, clicked_y);
                        }
                    }
                    break;
                }
            }
        });
    }
};

function draw_map(ctx, image_map, start_x, start_y, box_length){
    var i, j,
        map_key,
        image_map_length = image_map.length

    for (i=0; i < image_map_length; i++) {
        var sub_arr_len = image_map[i].length;
        for (j = 0; j < image_map[i].length; j++) {
            map_key = image_map[i][j];
            x = start_x + box_length * j;
            y = start_y + box_length * i;
            draw_box(ctx, x, y, box_length, box_length, map_key, "green");
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

function get_max_level(loc) {
    var max_level;
    switch(loc) {
        case "S":
            max_level = 6;
            break;
        case "F":
            max_level = 4;
            break;
        case "P":
            max_level = 3;
            break;
        case "VC":
            max_level = 5;
            break;
    };
    return max_level;
};