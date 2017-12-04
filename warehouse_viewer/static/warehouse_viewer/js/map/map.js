var map_cpu = {
    start: function(data_type, data, form_data) {
        if (data_type == "item_count") {
            var loc = form_data["loc"];

            var color_map = color_map_functions.item_count(data);

            imageMap_obj.imageMap_ajax(loc);
        }
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
    item_count: function(item_count_dic) {
        console.log(item_count_dic);
    },
};