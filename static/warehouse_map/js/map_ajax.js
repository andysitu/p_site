function set_data_type() {
    function create_options(){
        var data_arr = null,
            data_select = $( '#data-type-select' ),
            data_arr_len;

        data_arr = [
            "item_ct", "Item Count",
        ];
        data_arr_len = data_arr.length/2;

        for (i=0; i < data_arr_len; i++) {
            data_select.append($("<option>",
                {
                    value: data_arr[i * 2],
                    text: data_arr[i * 2 + 1],
                }));
        }
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
    $.ajax({
        url: date_ajax_url,
        data: {

        },
        dateType: "json",
        success: function(date_list) {
            var date_select_jobj = $('#date-select'),
                i,
                date_list_len = date_list.length;
            for (i = 0; i < date_list_len; i++) {
                date_select_jobj.append($("<option>", {
                    text: date_list[i],
                }));
            }
        }
    });
};