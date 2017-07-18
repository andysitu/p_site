for (var a in django_data) {
    console.log(django_data[a]["fields"].test_field)
}

// var map_canvas = document.getElementById('map_canvas');
// console.log(map_canvas)
// var ctx = map_canvas.getContext('2d');

$( document ).ready(function() {
    var map_canvas = $( '#map_canvas' )[0];

    side_nav_bar_width = $( '#sidebar-nav-div' ).outerWidth();
    console.log(side_nav_bar_width)

    canvas_width = $(window).width() - side_nav_bar_width - 30;
    canvas_height = $(window).height() - 50;

    map_canvas.width = canvas_width
    map_canvas.height = canvas_height;
    console.log(map_canvas)
    var ctx = map_canvas.getContext('2d');
    ctx.fillStyle = 'gray';
    ctx.fillRect(0,10,canvas_width,canvas_height);
});