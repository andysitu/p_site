for (var a in django_data) {
    console.log(django_data[a]["fields"].test_field);
}

// var map_canvas = document.getElementById('map_canvas');
// console.log(map_canvas)
// var ctx = map_canvas.getContext('2d');

$( document ).ready(function() {
    var map_canvas = $( '#map_canvas' )[0];

    side_nav_bar_width = $( '#sidebar-nav-div' ).outerWidth();

    canvas_width = $(window).width() - side_nav_bar_width - 50;
    canvas_height = $(window).height() - 50;

    map_canvas.width = canvas_width;
    map_canvas.height = canvas_height;
    var ctx = map_canvas.getContext('2d');

    var original_color = ctx.fillStyle;

    ctx.fillStyle = "rgb(225,225,225)";
    ctx.fillRect(0,0,canvas_width,canvas_height);
    ctx.fillStyle = original_color;


    $( '#map_canvas' ).click(function(e) {
        console.log(e.offsetX, e.offsetY);
    })

    draw_p(ctx,0,0,30,15);
});

function draw_aisle(ctx,start_x, start_y, width, height, num_shelf, vertical) {
    if (vertical == undefined) {
        vertical = false;
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
    return info_obj;
}

function draw_p(ctx, canvas_x, canvas_y, width, height, scale) {
    if (scale == undefined) {
        scale = 1;
    }
    width *= scale
    height *= scale

    var start_x = canvas_x + 5,
        start_y = canvas_y + 5,
        x = start_x,
        y = start_y,
        rest,
        i,
        num_double_aisles = 13;;

    // Aisle 27
    ctx.fillStyle = 'orange';
    ({x, y, ...rest} = draw_aisle(ctx,x,y,width,height,2,false));
    x += width*2;
    ({x, y, ...rest} = draw_aisle(ctx,x,y,width,height,5,false));
    x += width*2;
    ({x, y, ...rest} = draw_aisle(ctx,x,y,width,height,5,false));
    x += width*2;
    ({x, y, ...rest} = draw_aisle(ctx,x,y,width,height,5,false));

    // Rest of aisles
    for (i = 0; i < num_double_aisles; i++) {
        x = start_x;
        y = y+height*2;

        var num_first_columns = 12;
        draw_aisle(ctx,x,y,width,height,12,false);
        draw_aisle(ctx,x+width*(num_first_columns+1),y,width,height,11,false);

        y += height;
        draw_aisle(ctx,x,y,width,height,12,false);
        draw_aisle(ctx,x+width*(num_first_columns+1),y,width,height,11,false);
    }
}

function draw_s(ctx, canvas_x, canvas_y, width, height) {

}