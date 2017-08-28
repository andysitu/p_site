function get_data_select_type(data_type) {
    // Key represents data name
    // Value is whether a second date is needed
    var data_dic =  {
        "Item Count": false,
        "Item Change": true,
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
        success: function(date_list) {
            var date_select_jobj = $('#date-select'),
                date_select2_jobj = $('#date-select-2'),
                i,
                date_list_len = date_list.length;

            for (i = 0; i < date_list_len; i++) {
                date_select_jobj.append($("<option>", {
                    text: date_list[i],
                }));

                date_select2_jobj.append($("<option>", {
                    text: date_list[i],
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

function map_search(e) {
    var level,
        data_type,
        date_1,
        date_2;
    console.log("SEARCH");
    console.log(e);
};