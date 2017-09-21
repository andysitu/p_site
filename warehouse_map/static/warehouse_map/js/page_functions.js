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
        map_ajax.set_date_input();
        map_ajax.change_data_type_select();
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

var menu_screen = {
    empty: function() {
        $( '#menu-screen-container').empty();
    },
    fill_delmenu: function() {
        var $menu_container = $( '#menu-screen-container'),
            $form_group = $("<form>", {
                id: "date-del-form",
                method: "post",
                action: "/test/",
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
            var $form_group = $('#date-del-form');

            e.preventDefault();
            console.log($date_del_select.val());
            console.log($form_group.attr("method"));
            console.log($form_group.attr("action"));
            console.log($form_group.serialize());
        })
    },
};