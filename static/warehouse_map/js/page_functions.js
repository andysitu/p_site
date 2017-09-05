/*
For functions that edit everything except canvas, ie the map
 */


var page_functions = {
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
        var msg = "<div class='underline'>" + gettext("Location") + ": " + location + "</div>";

        if (info_dic != undefined) {
            var dic_key, dic_key_2;

            for (dic_key in info_dic) {
                if (typeof info_dic[dic_key] == "object") {
                    msg += dic_key + "<br>";

                    for (dic_key_2 in info_dic[dic_key]){
                        console.log(dic_key_2);
                        msg += dic_key_2 + ": " + info_dic[dic_key][dic_key_2] + "<br>";
                    }
                } else {
                    var trans_dic_key = '';
                    switch(dic_key) {
                        case "total":
                            trans_dic_key = gettext("total");
                            break;
                        default:
                            trans_dic_key = dic_key;
                    };
                    msg += trans_dic_key + ": " + info_dic[dic_key] + "<br>";
                }
            }
        }

        $('#display-msg-text').html(msg);
    },
};


