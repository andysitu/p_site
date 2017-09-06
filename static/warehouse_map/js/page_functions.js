/*
For functions that edit everything except canvas, ie the map
 */

var page_functions = {
    div_underline_class: "underline",
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
        var underline_div = "<div class='" + this.div_underline_class + "'>",
            msg = underline_div + gettext("Location") + ": " + location + "</div>";

        if (info_dic != undefined) {
            msg += this.make_msg(info_dic);
        }

        $('#display-msg-text').html(msg);
    },
    make_msg: function(info_dict, msg) {
        if (msg == undefined) {
            msg = ''
        }

        for (key in info_dict) {
            var value = info_dict[key];

            if (typeof value == "object") {
                msg += key + "<br>" + this.make_msg(value);
            } else {
                msg += key + ": " + info_dict[key] + "<br>";
            }
        }
        return msg
    }
};