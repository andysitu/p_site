function get_data_select_type(data_type) {
    // Key represents data name
    // Value is whether a second date is needed
    var data_dic =  {
        "Item Count": false,
        "Items Shipped": true,
    }
    if (arguments.length == 1) {
        return data_dic[data_type];
    } else
        return data_dic;
};

function set_data_type() {
    function create_options(){
        var data_arr = null,
            data_select = $( '#data-type-select' );

        data_select_dic = get_data_select_type();

        for (var k in data_select_dic) {
            data_select.append($("<option>",
                {
                    text: k,
                }));
        }

        check_date_input2_hidden()
    };
    create_options()
};

function set_level_input(maxLevel) {
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
    create_options(maxLevel)

    $( '#minus-level' ).click(decrease_level);

    $( '#plus-level' ).click(increase_level);
};

function set_date_input() {
/*
    Fill both date html select with dates.
 */
    $.ajax({
        url: date_ajax_url,
        data: {

        },
        dateType: "json",
        success: function(date_dic) {
            var date_list = date_dic["date_list"],
                date_id_list = date_dic["date_id_list"];

            var date_select_jobj = $('#date-select'),
                date_select2_jobj = $('#date-select-2'),
                i,
                date_list_len = date_id_list.length;

            for (i = 0; i < date_list_len; i++) {
                date_select_jobj.append($("<option>", {
                    text: date_list[i],
                    value: date_id_list[i],
                }));

                date_select2_jobj.append($("<option>", {
                    text: date_list[i],
                    value: date_id_list[i],
                }));
            }
        }
    });
};

function check_date_input2_hidden() {
/*
   Checks if date-input-2 should be hidden based on the
    value of data-type.
*/
    var data_type = $('#data-type-select').val();
    if (get_data_select_type(data_type))
         $('#date-select-2-div').attr('hidden', false);
    else
        $('#date-select-2-div').attr('hidden', true);
};

function change_data_type_select() {
    // Ajax that runs when data-type select is changed
    //  Sees if the second data type should be hidden

    $('#data-type-select').change(function(e){
        check_date_input2_hidden();
    });
};

function map_search(map_data_arr) {

    var level           = $("#level-select").val(),
        data_type       = $("#data-type-select").val(),
        date_1_inst_id  = $("#date-select").val(),
        date_2_inst_id  = $("#date-select-2").val(),
        i,
        map_data_length = map_data_arr.length;

    if (level === null && data_type === null) {
        return 0;
    }

    // Check if date_1 and date_2 should be different
    if (get_data_select_type(data_type) && date_1_inst_id == date_2_inst_id) {
        return 0;
    }

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    for (i = 0; i < map_data_length; i++) {
        var map_data_dic = map_data_arr[i];
        $.ajax({
            url: map_search_info_url,
            data: {
                "loc": map_data_dic["loc"],
                "data_type": data_type,
                // "location_map[]": map_data_dic["location_map"],
                "level": level,
                "date_1_inst_id": date_1_inst_id,
                "date_2_inst_id": date_2_inst_id,
            },
            method: "POST",
            dateType: "json",
            success: function (data_map) {
                color_map = make_color_map(data_type, data_map);
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
                console.log(map_data_arr);
                make_map(map_data_arr);
            }
        });
    }
};