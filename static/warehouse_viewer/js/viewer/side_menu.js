function set_settings_from_mode() {
    var mode_type = $("#data-mode").val();

    clear_settings();

    var mode_settingsObj;
    switch(mode_type) {
        case "map":
            mode_settingsObj = map_mode_settings;
            break;
        case "chart":
            mode_settingsObj = chart_mode_settings;
            break;
        case "graph":
            mode_settingsObj = graph_mode_settings;
            break;
        default:
            return 1;
    };
    var $menu_div = mode_settingsObj.make_menu();
    $("#mode-settings-div").append($menu_div);
}

function clear_settings() {
    $("#mode-settings-div").empty();
}

var map_mode_settings = {
    make_menu: function(container_id) {},
};

var chart_mode_settings = {
    data_select_id: "data-type-select",
    make_menu: function(container_id) {
        var $container = $("<div>", {
                    id: container_id,
                }),
            data_type_dic = {
                    "item_count": "Item Count",
                };

        var $dataType_select = settings_maker.data_type(data_type_dic, this.data_select_id);
        $container.append($dataType_select);

        return $container;
    },
    data_type_set_menu: function() {},
};

var graph_mode_settings = {
    make_menu: function(container_id) {},
};

var settings_maker = {
    data_type: function(data_type_dic, select_id) {
        var $div = $("<div class='form-group'>");

        $("<label>", {
            "for": select_id,
        }).html("Data Type").appendTo($div);

        var $select = $("<select>", {
            id: select_id,
            "class": "form-control",
        }).appendTo($div);

        for (var data_type_value in data_type_dic) {
            $("<option>", {
                "value":  data_type_value
            }).text(data_type_dic[data_type_value]).appendTo($select);
        }

        return $div

    },
    date_input: function(id) {

    },
};