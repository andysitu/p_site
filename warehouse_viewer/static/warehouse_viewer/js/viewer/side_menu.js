var side_menu = {
    container_id: "side-menu-div",
    set_settings_from_mode: function () {
        var mode_type = $("#data-mode").val();

        this.clear_settings();

        var mode_settingsObj;
        switch (mode_type) {
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
        }
        ;
        var $menu_div = mode_settingsObj.make_menu(this.container_id);
        $("#mode-settings-div").append($menu_div);
        mode_settingsObj.add_submenu_from_dataType();
    },
    clear_settings: function() {
        $("#mode-settings-div").empty();
    },
};


var map_mode_settings = {
    make_menu: function(container_id) {},
};


var chart_mode_settings = {
    data_select_id: "data-type-select",
    subsettings_container_id: "settings-container",
    make_menu: function(container_id) {
        var data_select_id = this.data_select_id,
            $container = $("<div>", {
                    id: container_id,
                }),
            data_type_dic = {
                    "item_count": "Item Count",
                };

        var $dataType_select_div = settings_maker.data_type(data_type_dic, data_select_id);
        $container.append($dataType_select_div);

        var $dataType_select = $("#" + data_select_id);

        $dataType_select.change(function(e){
            this.add_submenu_from_dataType();
        });

        this.add_submenu_from_dataType();

        return $container;
    },
    add_submenu_from_dataType: function() {
        $("#" + this.subsettings_container_id).empty();

        var data_select_id = this.data_select_id,
            $dataType_select = $("#" + data_select_id),
            data_type = $dataType_select.val();

        this.data_type_set_menu(data_type);
    },
    data_type_set_menu: function(data_type) {
        switch(data_type) {
            case "item_count":
                console.log("item_count");
                break;
        }
    },
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