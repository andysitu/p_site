function make_color_map(data_type, data_map) {
    var color_map = {};

    if (data_type == "Item Count"){
        color_map = item_count_map(data_map);
    }

    return color_map;
};

function item_count_map(data_map, r, g, b) {
    var color_map = {},
        rack_loc= null,
        item_sku = null,
        max_num = 0;

    for (rack_loc in data_map) {
        var rack_item_num = 0;
        item_dic = data_map[rack_loc];

        for (item_sku in item_dic) {
            rack_item_num += item_dic[item_sku];
        }

        color_map[rack_loc] = rack_item_num;
        if (rack_item_num > max_num)
            max_num = rack_item_num;
    }

    return color_map;
}