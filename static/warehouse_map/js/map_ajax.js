var map_ajax = {
    csrf_it: function() {
        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !self.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
    },
    get_map_arr_ajax: function(location_arr, callback_funct) {
        /*
            Function that will use ajax to receive an array containing
            grid_data from each location called by location_arr and will
            run a callback_function on each location.
         */
        $.ajax({
            url: request_grid_url,
            data: {
                "loc[]": location_arr,
            },
            dataType: "json",
            success: function(map_data_arr) {
                callback_funct(map_data_arr);
            },
        });
    },
    set_data_type: function() {
        function create_options(){
            var data_arr = null,
                data_select = $( '#data-type-select' );

            data_select_dic = side_menu.data_select_trans_dic;

            for (var k in data_select_dic) {
                data_select.append($("<option>",
                    {
                        text: data_select_dic[k],
                        value: k,
                    }
                ));
            }

            map_ajax.check_date_input2_hidden();
        };

        create_options();
    },
    set_level_input: function(maxLevel) {
        if (maxLevel == null)
            maxLevel = 6;

        function create_options(maxLevel){
            var i;
            var level_input = $( '#level-select' );
            level_input.append($("<option>", {value: "All", text: "All",}));
            for (i=1; i <= maxLevel; i++) {
                level_input.append($("<option>", {value: i, text: i,}));
            }
        };

        function increase_level(e){
            var level_input = $( '#level-select' );
            var level = level_input.val();
            if (level == "All") {
                level = 1;
            } else {
                level = parseInt(level);
                level++;
                if (level >= maxLevel){
                    level = maxLevel;
                }
            }
            level_input.val(level);
        };

        function decrease_level(e){
            var level_input = $( '#level-select' );
            var level = level_input.val();
            if (level == "1") {
                level = 'All';
            } else if (level == 'All'){
                level == 'All';
            } else {
                level = parseInt(level);
                level--;
            }
            level_input.val(level);
        };
        create_options(maxLevel);

        $( '#minus-level' ).click(decrease_level);

        $( '#plus-level' ).click(increase_level);
    },
    get_dates: function(callback_function) {
    /*
        Fill both date html select with dates.
        On success, date_dic is return, containing
            [date_list] & [date_id_list]
     */
        var dates_dic;

        $.ajax({
            url: date_ajax_url,
            data: {

            },
            dateType: "json",
            success: function(date_dic) {
                callback_function(date_dic);
            }
        });
    },
    check_date_input2_hidden: function() {
    /*
       Checks if date-input-2 should be hidden based on the
        value of data-type.
    */
        var data_type = $('#data-type-select').val();

        if (side_menu.get_data_select_type(data_type)) {

            $('#date-select-2-div').attr('hidden', false);
        } else
            $('#date-select-2-div').attr('hidden', true);
    },
    change_data_type_select: function() {
        // Ajax that runs when data-type select is changed
        //  Sees if the second data type should be hidden

        $('#data-type-select').change(function(e){
            map_ajax.check_date_input2_hidden();
        });
    },

    map_search: function(map_data_arr){
        var level           = $("#level-select").val(),
            data_type       = $("#data-type-select").val(),
            date_1_inst_id  = $("#date-select").val(),
            date_2_inst_id  = $("#date-select-2").val(),
            time_period = parseInt($("#prev-dateAmount-input").val()),
            i,
            map_data_length = map_data_arr.length;

        if (level === null && data_type === null) {
            return 0;
        }

        // Check that time_period is error or default to 1
        if (typeof(time_period) != "number")
            time_period = 1;

        // Check if date_1 and date_2 should be different
        if (side_menu.get_data_select_type(data_type) && date_1_inst_id == date_2_inst_id) {
            return 0;
        }

        this.csrf_it();
        for (i = 0; i < map_data_length; i++) {
            var map_data_dic = map_data_arr[i];
            $.ajax({
                url: map_search_info_url,
                data: {
                    "loc": map_data_dic["loc"],
                    "data_type": data_type,
                    "level": level,
                    "date_1_inst_id": date_1_inst_id,
                    "date_2_inst_id": date_2_inst_id,
                    "time_period": time_period,
                },
                method: "POST",
                dateType: "json",
                success: function (data_map) {
                    color_map = color_map_functions.make_color_map(data_type, data_map);
                    map_data_dic["data_map"] = data_map;
                    map_data_dic["color_map"] = color_map;

                    // Test if there is a color map & data map in all data_dics
                    // by searching through the data_arr
                    var i, data_arr_len = map_data_arr.length
                    for (var i = 0; i < data_arr_len; i++) {
                        var data_dic = map_data_arr[i];

                        if (!("color_map" in data_dic)) {
                            return 0;
                        }
                    }
                    canvasMap.make_map(canvasMap.map_data_arr, false, level);

                    sessionStorage.setItem("map_data_entireArr", JSON.stringify(map_data_arr));
                    sessionStorage.setItem("search_level", level);
                    sessionStorage.setItem("search_data_type", data_type);
                    sessionStorage.setItem("search_date_1", date_1_inst_id);
                    sessionStorage.setItem("search_date_2", date_2_inst_id);
                    sessionStorage.setItem("search_level", level);
                }
            });
        }
    },
    fill_delMenu_date: function() {
        $.ajax({
            url: date_ajax_url,
            data: {

            },
            dateType: "json",
            success: function(date_dic) {
                var date_list = date_dic["date_list"],
                    date_id_list = date_dic["date_id_list"],
                    $date_select = $( '#date-del-select' );

                var i,
                    date_list_len = date_id_list.length;

                for (i = 0; i < date_list_len; i++) {
                    $date_select.append($("<option>", {
                        text: date_list[i],
                        value: date_id_list[i],
                    }));
                }
            }
        });
    },
    submit_date_del: function(e) {
        var $form_group = $('#date-del-form');

        this.csrf_it();

        $.ajax({
            type: $form_group.attr("method"),
            url: $form_group.attr("action"),
            data: $form_group.serialize(),
            success: function(data) {
                window.location.reload(true);
            },
            error: function(data) {
                page_functions.write_msg("ERROR in deleting by date");
                console.log("ERROR in ajax date del");
                console.log("DATA", data);
            },
        });
    },
};