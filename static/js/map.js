for (var a in django_data) {
    console.log(django_data[a]["fields"].test_field)
}

// var map_canvas = document.getElementById('map_canvas');
// console.log(map_canvas)
// var ctx = map_canvas.getContext('2d');

$( document ).ready(function() {
    var map_canvas = $( '#map_canvas' )[0];

    side_nav_bar_width = $( '#sidebar-nav-div' ).outerWidth();

    canvas_width = $(window).width() - side_nav_bar_width - 50;
    canvas_height = $(window).height() - 50;

    map_canvas.width = canvas_width
    map_canvas.height = canvas_height;
    var ctx = map_canvas.getContext('2d');
    draw_aisle(ctx,10,10,50,30,10)

    draw_aisle(ctx,10,70,50,30,10)
});

function draw_aisle(ctx,start_x, start_y,width, height,num_shelf) {
    var i

    for (i = 0; i < num_shelf; i++) {
        ctx.strokeRect(start_x + i * width,start_y, width, height);
    }
}