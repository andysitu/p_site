var viewer_processor = {
    submit_search: function(form_element, callback_function) {
        var $form = $( form_element.target ),
            data_array = $form.serializeArray(),
            form_url = $form.attr("action"),
            form_method = $form.attr("method");

        var form_data = {},
            i,
            data_arr_len = data_array.length;

        for (i = 0; i < data_arr_len; i++) {
             var data_dic = data_array[i];
             if (data_dic["name"] != "csrfmiddlewaretoken") {
                 form_data[data_dic["name"]] = data_dic["value"];
             }
        }

        var data_mode = form_data["mode"],
            data_type = form_data['data-type'];

        $.ajax({
            // warehouse_viewer.search_ajax
            url: form_url,
            data: form_data,
            method: form_method,
            success: function(data) {
                var proccessed_data = viewer_processor.process(form_data, data);

                // TODO SAVE PROCESSED DATA

                var filtered_proc_data = viewer_processor.filter(form_data, proccessed_data);
                viewer.display(data_mode, data_type, filtered_proc_data);
                callback_function();
            },
        });
    },
    process: function(form_data, data) {
        /**
         * Handles processing thru JS,
         *  after retrieving the data
         */
        console.log(form_data);

        var mode = form_data["mode"],
            data_type = form_data["data-type"];
        if (mode == "chart") {
            if (data_type == "empty_locations") {
                data["empty-locations"] = data["empty-locations"].sort(
                    helper_functions.compare_locations);
            }
        }

        return data;
    },
    filter: function(form_data, data) {
        var mode = form_data["mode"],
            data_type = form_data["data-type"];

        var level = form_data["level"],
            level_modifier = form_data["level-modifier"];
        if (mode == "chart") {
            if (data_type == "empty_locations") {
                if (level != "all")
                data["empty-locations"] = helper_functions.filter_locations_arr_by_level(
                    data["empty-locations"],
                    level,
                    level_modifier,
                );
            }
        }
        return data;
    },
};

var viewer_storage = {
    retrieve: function() {

    },
    save: function() {

    },

    store: function() {

    },
    get: function() {

    }
};

var helper_functions = {
    filter_location_arr: function() {

    },
    compare_locations: function(a, b) {
        var re = /^USLA\.(\w)\.(\d+)\.(\d+)\.(\d+)/;
        var a_re_results = re.exec(a),
            b_re_results = re.exec(b);

        var a_area = a_re_results[1],
            a_aisle = a_re_results[2],
            a_column = a_re_results[3],
            a_level = a_re_results[4],
            b_area = b_re_results[1],
            b_aisle = b_re_results[2],
            b_column = b_re_results[3],
            b_level = b_re_results[4];

        if (a_area != b_area) {
            return a_area.localeCompare(b_area);
        } else if (a_aisle != b_aisle) {
            return parseInt(a_aisle) - parseInt(b_aisle);
        } else if (a_column != b_column) {
            return parseInt(a_column) - parseInt(b_column);
        } else if (a_level != b_level) {
            return parseInt(a_level) - parseInt(b_level);
        } else {
            return 0;
        }
    },
    filter_locations_arr_by_level: function(locations_arr, level, level_modification) {
        var filterer = (function compare_function() {
            if (level_modification == "lt") {
                return function(loc_level) {
                    return loc_level <= level;
                }
            } else if (level_modification == "gt") {
                return function(loc_level) {
                    return loc_level >= level;
                }
            } else {
                return function(loc_level) {
                    return loc_level == level;
                }
            }
        })();

        var i, re_result, level,
            locations_len = locations_arr.length,
            new_loc_arr = [],
            re = /\.(\d+)$/;

        for (i =0; i < locations_len; i++) {
            re_result = re.exec(locations_arr[i]);
            loc_level = re_result[1];
            if (filterer(loc_level)) {
                new_loc_arr.push(locations_arr[i]);
            }
        }
        return new_loc_arr;
    }
}