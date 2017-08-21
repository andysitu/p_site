const BACKGROUND_COLOR = "rgb(225,225,225)";
// const BACKGROUND_COLOR = "white";

$( document ).ready(function() {
    (function set_canvas() {
        var map_canvas_jobj = $( '#map_canvas' ),
            map_canvas = map_canvas_jobj[0];

        side_nav_bar_width = $( '#sidebar-nav-div' ).outerWidth();

        var canvas_width = $(window).width() - side_nav_bar_width,
            canvas_height = $(window).height() - 50;

        map_canvas.width = canvas_width;
        map_canvas.height = canvas_height;
    })();

    var loc_list = ['F', 'VC', 'S', 'P',];
    $.ajax({
        url: request_grid_url,
        data: {
            "loc[]": loc_list,
        },
        dataType: "json",
        success: function(data_list) {
            console.log(data_list);
            // var image_map = data["image_map"],
            //     location_map = data["location_map"];
            make_map(data_list);
        },
    });
});

function make_map(data_list) {
    var map_canvas_jobj = $( '#map_canvas' ),
        map_canvas = map_canvas_jobj[0],
        i;

    var canvas_width = map_canvas.width,
        canvas_height = map_canvas.height;

    var ctx = map_canvas.getContext('2d');

    // Get total width & length of arrays
    var max_num_down = 0,
        total_num_across = 0,
        data_length = data_list.length,
        num_down;
    for ( i = 0; i < data_length; i++) {
        data_dic = data_list[i];
        num_down = data_dic.num_down;

        if (num_down > max_num_down) {
            max_num_down = num_down
        }

        total_num_across += data_dic.num_across;
    }

    var box_width = Math.floor((canvas_width+ 1)/ total_num_across),
        box_height = Math.floor((canvas_height + 1)/ max_num_down),
        box_length;

    box_length = (box_width > box_height) ? box_height : box_width;

    var start_x =0, start_y = 0;
    for ( i = 0; i < data_length; i++) {
        data_dic = data_list[i];
        image_map = data_dic["image_map"];
        map_info = draw_map(ctx, image_map, start_x, start_y, box_length);

        data_dic["start_x"] = start_x;
        data_dic["start_y"] = start_y;
        data_dic["end_x"] = map_info["end_x"];
        data_dic["end_y"] = map_info["end_y"];
        data_dic["box_length"] = box_length;

        start_x = map_info["end_x"];
    }
    if (data_length === 4) {
        map_canvas_jobj.click(function (e) {
            var clicked_y = e.offsetY,
                clicked_x = e.offsetX,
                i, box_length;

            for (i = 0; i < data_length; i++) {
                data_dic = data_list[i];
                box_length = data_dic.box_length;
                if( clicked_x >= data_dic.start_x && clicked_x <= data_dic.end_x &&
                    clicked_y >= data_dic.start_y && clicked_y <= data_dic.end_y)
                {
                    location_map = data_dic["location_map"];
                    var y = Math.floor( (clicked_y - data_dic.start_y )/ box_length),
                        x = Math.floor( (clicked_x - data_dic.start_x ) / box_length);

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
        map_key;

    // Fill Background color

    // var original_color = ctx.fillStyle;

    // ctx.fillStyle = BACKGROUND_COLOR;
    // ctx.fillRect(0, 0, width, height);
    // ctx.fillStyle = original_color;

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

function draw_aisle(ctx,start_x, start_y, width, height, num_shelf, vertical, rack, empty) {
    var original_color = ctx.fillStyle;
    if (rack) {
        width *= 2;
        height *= 2;
    }
    if (vertical == undefined) {
        vertical = false;
    }

    if (empty) {
        ctx.fillStyle = BACKGROUND_COLOR;
    }

    var i;

    var info_obj = {};

    if (vertical) {
        for (i = 0; i < num_shelf; i++) {
            ctx.strokeRect(start_x, start_y + i * width, height, width);
            ctx.fillRect(start_x +1, start_y + i * width + 1, height -2, width -2);
        }
        info_obj["x"] = start_x;
        info_obj["y"] = start_y + i * height;
    } else {
        for (i = 0; i < num_shelf; i++) {
            ctx.strokeRect(start_x + i * width,start_y, width, height);
            ctx.fillRect(start_x + i * width + 1,start_y+1, width-2, height-2);
        }
        info_obj["x"] = start_x + i * width;
        info_obj["y"] = start_y;

    }
    ctx.fillStyle = original_color;
    return info_obj;
};

function draw_p(ctx, canvas_x, canvas_y, width, height, scale) {
    rack_width = width * 2;
    rack_height = height * 2;
    if (scale == undefined) {
        scale = 1;
    }
    rack_width *= scale
    rack_height *= scale

    ctx.fillStyle = 'orange';

    var start_x = canvas_x,
        start_y = canvas_y,
        x = start_x,
        y = start_y,
        rest,
        i,
        num_double_aisles = 13,
        racks_map = {};

    // Aisle 27
    ({x, y, ...rest} = draw_aisle(ctx,x,y,rack_width,rack_height,2,false));
    x += rack_width*2;
    ({x, y, ...rest} = draw_aisle(ctx,x,y,rack_width,rack_height,5,false));
    x += rack_width*2;
    ({x, y, ...rest} = draw_aisle(ctx,x,y,rack_width,rack_height,5,false));
    x += rack_width*2;
    ({x, y, ...rest} = draw_aisle(ctx,x,y,rack_width,rack_height,5,false));

    // Rest of aisles
    for (i = 0; i < num_double_aisles; i++) {
        x = start_x;
        y = y+rack_height*2;

        var num_first_columns = 12;
        draw_aisle(ctx,x,y,rack_width,rack_height,12,false);
        draw_aisle(ctx,x+rack_width*(num_first_columns+1),y,rack_width,rack_height,11,false);

        y += rack_height;
        draw_aisle(ctx,x,y,rack_width,rack_height,12,false);
        draw_aisle(ctx,x+rack_width*(num_first_columns+1),y,rack_width,rack_height,11,false);
    }
};


function GridSystem(ctx,start_x, start_y, boxWidth, boxHeight, numBox_x, numBox_y) {
    this.ctx = ctx;
    this.start_x = start_x;
    this.start_y = start_y;
    this.boxWidth = boxWidth;
    this.boxHeight = boxHeight;
    this.numBox_x = numBox_x;
    this.numBox_y = numBox_y;

    this.createGrid = function(){};

    (function(){
        var x = 1, y = 1;
    })();
};

function Box(x,y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
};

function RackBox(x, y) {
    Box.call(this, x, y, "rack");
    RackBox.prototype = Object.create(Box.prototype);
    RackBox.prototype.constructor = RackBox;
};

function ShelfBox(x, y) {
    Box.call(this, x, y, "shelf");
    ShelfBox.prototype = Object.create(Box.prototype);
    ShelfBox.prototype.constructor = ShelfBox;
};

function EmptyBox(x, y) {
    Box.call(x, y, "empty");
    EmptyBox.prototype = Object.create(Box.prototype);
    EmptyBox.prototype.constructor = ShelfBox
}

function CanvasSystem() {

};