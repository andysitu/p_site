/*
For functions that edit everything except canvas, ie the map
Contains page_functions [obj],
           menu_screen [obj]
 */

var page_functions = {
    div_underline_class: "underline",
    make_underline_div: function(text) {
        return "<div class='" + this.div_underline_class + "'>" + String(text) + "</div>";
    },
    make_menuScreen: function(menu_type) {
        // Delete any existing menu screens
        menu_screen.empty();

        switch(menu_type) {
            case "delete_date":
                menu_screen.fill_delmenu();
                break;
        };
    },
    fill_sidemenu: function(max_level) {
    /**
     * Clears out the settings on the sidemenu
     *  and then fills them in again. This is
     *  prevent duplicates in select.
     */
        $('#data-type-select').empty();
        $('#level-select').empty();
        $('#date-select').empty();
        $('#date-select-2').empty();

        map_ajax.set_level_input(max_level);
        map_ajax.set_data_type();
        side_menu.set_date_select_input("#date-select");
    },

    display_loc_info: function(location, info_dic) {
        /**
         * location: string, info_dic: dictionary with keys
         *   "total" and "items."
         * Displays this information in msg div.
         */
        var msg = this.make_underline_div(gettext("Location") + ": " + location);

        if (info_dic != undefined) {
            msg += this.make_underline_div(gettext("Total") + ": " + info_dic["total"]);
            msg += this.make_msg(info_dic["items"], true);
        }
        this.write_msg(msg);
    },
    write_msg: function(msg) {
        $('#display-msg-text').html(msg);
    },
    make_msg: function(info_dict, location) {
        /**
         * Function can be used recursively.
         * info_dict must be a dictionary.
         * location can be undefined; if true, it means that
         *   the keys of info_dict are location and will be
         *   sorted accordingly.
         * Returns a string in html format containing information
         *   from info_dic.
         */
        var i, key_len, key_list,
            msg = "";

        if (location === true) {
            key_list = Object.keys(info_dict).sort(function(a,b){
                a = a[a.length-1];
                b = b[b.length-1];

                if (a < b)
                    return -1;
                if (a > b)
                    return 1;
                return 0;
            });
        } else {
            key_list = Object.keys(info_dict).sort();
        }
        key_len = key_list.length;
        for (i = 0; i < key_len; i++) {
            key = key_list[i];
            var value = info_dict[key];

            if (typeof value == "object") {
                msg += this.make_underline_div(key) + this.make_msg(value);
            } else {
                msg += key + ": " + info_dict[key] + "<br>";
            }
        }
        return msg
    },
};

var side_menu = {
    data_select_trans_dic: {
        "Item Count": gettext("Item Count"),
        "Items Shipped": gettext("Items Shipped"),
        "Items Added": gettext("Items Added"),
    },
    get_data_select_type: function(data_type){
        // Key represents data name
        // Value is whether a second date is needed

        var data_dic =  {
            "Item Count": false,
            "Items Shipped": true,
            "Items Added": true,
        }
        if (arguments.length == 1) {
            return data_dic[data_type];
        } else
            return data_dic;
    },
    set_datatype_sel_changeEvent: function() {
        this.clear_side_menu_additions();
        this.add_sidemenu_additions();
    },
    add_sidemenu_additions: function() {
        var data_type = $('#data-type-select').val();

        if (data_type == "Items Shipped") {
            this.add_date_input2();
        } else if (data_type == "Items Added") {
            this.add_prev_time_period();
        }
    },
    clear_side_menu_additions: function() {
        $('#side-menu-additions').empty();
    },
    add_date_input2: function() {
    /*
       Checks if date-input-2 should be hidden based on the
        value of data-type.
    */
        var $addition_div = $('#side-menu-additions');

        var $div = $("<div>", {
            "class": "form-group",
            id: "date-select-2-div",
            }).appendTo($addition_div);
        $("<label>", {
           "for": "date-select-2",
            text: gettext("Previous Date"),
            }).appendTo($div);
        $("<select>", {
            "class": "form-control",
            id: "date-select-2",
            }).appendTo($div);
        side_menu.set_date_select_input("#date-select-2");
    },
    add_prev_time_period: function() {
        var $addition_div = $('#side-menu-additions');

        var $div = $("<div>", {
            "class": "form-group",
            id: "date-select-2-div",
            }).appendTo($addition_div);
        $("<label>", {
           "for": "prev-dateAmount-input",
            text: gettext("Time Period"),
            }).appendTo($div);

        var $div_input = $("<div>", {
                "class": "input-group",
            }).appendTo($div);
        $("<input>", {
            "class": "form-control",
            id: "prev-dateAmount-input",
            value: 1,
            }).appendTo($div_input);
        $("<span>", {
            "class": "input-group-addon",
            text: "Days"
            }).appendTo($div_input);
    },
    change_data_type_select: function() {
        // Ajax that runs when data-type select is changed
        //  Sees if the second data type should be hidden

        $('#data-type-select').change(function(e){
            side_menu.set_datatype_sel_changeEvent();
        });
    },
    set_date_select_input: function(select_id) {
        function date_setter(date_dic) {
            var date_list = date_dic["date_list"],
                date_id_list = date_dic["date_id_list"];

            var date_select_jobj = $(select_id),
                // date_select2_jobj = $('#date-select-2'),
                i,
                date_list_len = date_id_list.length;

            for (i = 0; i < date_list_len; i++) {
                date_select_jobj.append($("<option>", {
                    text: date_list[i],
                    value: date_id_list[i],
                }));

                // date_select2_jobj.append($("<option>", {
                //     text: date_list[i],
                //     value: date_id_list[i],
                // }));
            }
        }
        map_ajax.get_dates(date_setter)
    },
}

var menu_screen = {
    empty: function() {
        $( '#menu-screen-container').empty();
    },
    fill_delmenu: function() {
        var $menu_container = $( '#menu-screen-container'),
            $form_group = $("<form>", {
                id: "date-del-form",
                method: "post",
                action: date_del_url,
            }),
            $date_select_div = $("<div>", {
                id: "date-del-select-div",
            });

        $("<label>", {
            for: "date-del-select",
            text: gettext('Date'),
        })
            .appendTo($date_select_div);
        var $date_del_select = $("<select>", {
            "class": "form-control",
            id: "date-del-select",
            name: "delete_date",
        })
            .appendTo($date_select_div);

        var $date_del_but = $("<button>", {
            "type": "submit",
            id: "date-del-submit",
            "class": "btn btn-primary",
            "text": gettext("Delete"),
        });

        $form_group.append($date_select_div);
        $form_group.append($date_del_but);
        $menu_container.append($form_group);

        $form_group.submit(function(e) {
            e.preventDefault();

            map_ajax.submit_date_del();
        });
    },
};