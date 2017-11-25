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
                var proccessed_data = viewer_processor.process(data_mode, data_type, data);
                viewer.display(data_mode, data_type, proccessed_data);
                callback_function();
            },
        });
    },
    process: function(data_mode, data_type, data) {
        /**
         * Handles processing &filtering thru JS,
         *  after retrieving the data
         */
        if (data_mode == "chart") {
            if (data_type == "empty_locations") {
                function compare_locations(a, b) {
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
                }
                data["empty-locations"] = data["empty-locations"].sort(compare_locations);
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