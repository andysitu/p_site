var viewer_processor = {
    submit_search: function(form_element) {
        var form_data = helper_functions.form_element_to_form_data(form_element),
            form_url = form_element.target.action,
            form_method = form_element.target.method;

        var prev_raw_data = this.get_raw_data(form_data);
        console.log(form_data);
        if (prev_raw_data) {
            this.create_map(form_data, prev_raw_data);
        } else {
            $.ajax({
                // warehouse_viewer.search_ajax
                url: form_url,
                data: form_data,
                method: form_method,
                success: function(raw_data) {
                    viewer_processor.save_data(form_data, raw_data);
                    viewer_processor.create_map(form_data, raw_data);
                },
            });
        }
    },
    create_map: function(form_data, raw_data) {
        var data_mode = form_data["mode"],
            data_type = form_data['data-type'];

        var proccessed_data = viewer_processor.process_raw_data(form_data, raw_data);

        console.log("raw_data", raw_data);
        console.log("processed_data", proccessed_data);
        viewer.display(data_mode, data_type, proccessed_data, form_data);

        side_menu.renew_submitButton();
    },
    process_raw_data: function(form_data, raw_data) {
        /**
         * Handles processing thru JS,
         *  after retrieving the data
         */
        var processed_data = {}

        var mode = form_data["mode"],
            data_type = form_data["data-type"],
            level = form_data["level"],
            level_modifier = form_data["level-modifier"];

        if (mode == "chart" && data_type == "item_type_filter") {
            processed_data["item-type-filter"] = helper_functions.filter_item_type_filter(
                raw_data["item-type-filter_unfiltered"],
                form_data,
            );

            processed_data["item-type-filter"] = processed_data["item-type-filter"].sort(
                helper_functions.compare_locations);
        } else if (mode == "map") {
            if (data_type == "item_count") {
                processed_data = helper_functions.process_item_count(raw_data, form_data);
            }
        } else {
            processed_data = raw_data;
        }
        return processed_data;
    },
    __prev_search_form_data: null,
    _prev_search_raw_data: null,
    get_raw_data: function(form_data) {
        var prev_form_data = this._prev_search_form_data;

        if (prev_form_data) {
            var data_mode = form_data["mode"],
                data_type = form_data['data-type'],
                date1 = form_data["date-1"],
                prev_data_mode = prev_form_data["mode"],
                prev_data_type = prev_form_data['data-type'],
                prev_date1 = form_data["date-1"];

            if (
                data_mode === prev_data_mode &&
                data_type === prev_data_type && date1 === prev_date1
            ) {
                var loc = form_data["loc"],
                    prev_loc = prev_form_data["loc"];
                if (loc === prev_loc) {
                    return this._prev_search_raw_data;
                }
            }
        } else
            return null;
    },
    save_data: function(form_data, raw_data) {
        this._prev_search_form_data = form_data;
        this._prev_search_raw_data = raw_data;
    },
};

var helper_functions = {
    process_item_count: function(raw_data, form_data) {
        var processed_data = {},
            level = form_data["level"],
            level_modifier = form_data["level-modifier"],
            re = /\.(\d+)$/;

        var filterer = this.make_level_filterer(level, level_modifier),
            js_loc_code, location,
            item_dic,
            proc_loc_dic, proc_item_dic, proc_items,
            items, item_sku,
            total, item_quantity;

        for (js_loc_code in raw_data) {
            total = 0;
            item_dic = raw_data[js_loc_code]["items"];
            for (location in item_dic) {
                re_result = re.exec(location);
                loc_level = re_result[1];
                if (filterer(loc_level)) {
                    // Fill values in processed_data
                    if (!(js_loc_code in processed_data)) {
                        processed_data[js_loc_code] = {"items": {}, "total": 0};
                    }
                    proc_loc_dic = processed_data[js_loc_code];
                    proc_item_dic = proc_loc_dic["items"];

                    proc_items = proc_item_dic[location] = {};

                    items = item_dic[location];
                    for (item_sku in items) {
                        item_quantity = items[item_sku]
                        total += item_quantity;
                        proc_items[item_sku] = item_quantity;
                    }
                    proc_loc_dic["total"] = total;
                }
            }
        }
        return processed_data;
    },
    compare_locations: function(a, b) {
        var re = /^USLA\.(\w+)\.(\d+)\.(\d+)\.(\d+)/;
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
    make_level_filterer: function(level, level_modifier) {
        if (level == "all") {
            return function(loc_level) {
                return true;
            }
        } else if (level_modifier == "lte") {
            return function(loc_level) {
                return loc_level <= level;
            }
        } else if (level_modifier == "gte") {
            return function(loc_level) {
                return loc_level >= level;
            }
        } else {
            return function(loc_level) {
                return loc_level == level;
            }
        }
    },
    filter_item_type_filter: function(unfiltered_locations_dic, form_data) {
        var locations_arr = [],
            loc_dic = null, loc_dic_len,
            num_item_types = form_data["num-item-types"],
            num_item_type_modifier = form_data["num-item-type-modifier"];

        for (var location in unfiltered_locations_dic) {
            loc_dic = unfiltered_locations_dic[location];
            loc_dic_len = Object.keys(loc_dic).length;
            if (num_item_type_modifier == "lte") {
                if (loc_dic_len <= num_item_types)
                    locations_arr.push(location)
            } else if (num_item_type_modifier == "gte") {
                if (loc_dic_len >= num_item_types)
                    locations_arr.push(location)
            } else if (num_item_type_modifier == "eq") {
                if (loc_dic_len == num_item_types)
                    locations_arr.push(location)
            }
        }

        var level = form_data["level"],
            level_modifier = form_data["level-modifier"];

        var filterer = this.make_level_filterer(level, level_modifier);

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
    },
    get_multiple_select_dates: function() {
        var dates_select_id = element_ids.mutiple_dates_select_id;

        return $("#" + dates_select_id).val();
    },
    form_element_to_form_data: function(form_element) {
        var $form = $( form_element.target ),
            data_array = $form.serializeArray();

        var form_data = {},
            i,
            data_arr_len = data_array.length;

        for (i = 0; i < data_arr_len; i++) {
             var data_dic = data_array[i];
             if (data_dic["name"] != "csrfmiddlewaretoken") {
                 form_data[data_dic["name"]] = data_dic["value"];
             }
        }

        // Get multiple dates from multiple select if present.
        if (element_ids.mutiple_dates_select_name in form_data) {
            var multiple_dates_name = element_ids.mutiple_dates_select_name;
            form_data[multiple_dates_name + "[]"] = this.get_multiple_select_dates();
        }
        return form_data;
    }
}