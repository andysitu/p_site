for (var a in django_data) {
    console.log(django_data[a]["fields"].test_field);
}

// var map_canvas = document.getElementById('map_canvas');
// console.log(map_canvas)
// var ctx = map_canvas.getContext('2d');

const BACKGROUND_COLOR = "rgb(225,225,225)";

$( document ).ready(function() {
    var map_canvas = $( '#map_canvas' )[0];

    side_nav_bar_width = $( '#sidebar-nav-div' ).outerWidth();

    var canvas_width = $(window).width() - side_nav_bar_width - 50,
        canvas_height = $(window).height() - 50;

    map_canvas.width = canvas_width;
    map_canvas.height = canvas_height;

    var ctx = map_canvas.getContext('2d');


    draw_map(ctx, image_map, 0, 0, canvas_width, canvas_height);


    $( '#map_canvas' ).click(function(e) {
        console.log(e.offsetX, e.offsetY);
    })

    // draw_p(ctx,0,0,15,7);
    // draw_s(ctx,0,0,30,15);
});

function draw_map(ctx, image_map, start_x, start_y, width, height){
    var i, j,
        num_down = image_length = image_map.length,
        map_key;

    var num_across = image_map[0].length;

    var box_width = Math.floor((width - num_across + 1)/ num_across),
        box_height = Math.floor((height - num_down + 1)/ num_down);

    // Fill Background color
    var original_color = ctx.fillStyle;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = original_color;

    for (i=0; i < image_length; i++) {
        var sub_arr_len = image_map[i].length;
        for (j = 0; j < sub_arr_len; j++) {
            map_key = image_map[i][j];
            x = box_width * j;
            y = box_height * i;
            console.log(x,y,box_width,box_height);
            draw_box(ctx, x, y, box_width, box_height, map_key, "green");
        }
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

function draw_s(ctx, canvas_x, canvas_y, width, height, scale) {
    if (scale == undefined) {
        scale = 1;
    }
    width *= scale;
    height *= scale;

    var start_x = canvas_x + 5,
        start_y = canvas_y + 5,
        x = start_x,
        y = start_y,
        rest,
        i,
        num_double_aisles = 13;
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