/*
For functions that edit everything except canvas, ie the map
 */

var page_functions = {
    div_underline_class: "underline",
    make_underline_div: function(text) {
        return "<div class='" + this.div_underline_class + "'>" + String(text) + "</div>";
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
    }
};