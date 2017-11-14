var $display_container;

$( document ).ready(function(){
    $display_container = $("#display-container");

    side_menu.set_settings_from_mode();

    $("#data-mode").change(function() {
        side_menu.set_settings_from_mode();
    });

    $("#side-menu-form").submit(function(e) {
        e.preventDefault();
        side_menu.submit(e)});
});

var viewer = {
    chart: chart,
    show_loading: function() {
        $display_container.empty();
        $("#submit-button");
    },

    display: function(data_mode, data_type, data) {
        console.log(data_mode, data_type, data);

        this.show_loading();

        $display_container.empty();
        if (data_mode == "chart") {
            chart.create_page(data_type, data);
        }
    },
};

var chart = {
    create_page: function(data_type, data) {
        var $elements_dic = this.display_info(data),
            div_name = null;

        for (var ele_name in $elements_dic) {
            div_name = ele_name + '-div';
            $elements_dic[ele_name].appendTo("<div>", {id: div_name})
                .appendTo($display_container);
        }

        $("<div>", {
            "class": "right-sidebar col-sm-2",
            text: "HELLO",
        }).appendTo($("#body-div-row"));
    },
    display_info: function(data) {
        var $table,
            $elements = {};

        $elements["num-items"] = $("<p>", {
            "text": gettext("Total Number of Items") + ": " + data["total"],
            id: "num-items",
        });
            // .appendTo( $("<div>", {id: "num-items-div"}) ).appendTo($display_container);
        $elements["item-types"] = $("<p>", {
            "text": gettext("Number of Item Types") + ": " + data["item_types"],
            id: "item-types",
        });
            // .appendTo( $("<div>", {id: "item-types-div"}) ).appendTo($display_container);
        $elements["num-custs"] = $("<p>", {
            "text": gettext("Number of Customers") + ": " + data["customers_num"],
            id: "num-custs",
        });
            // .appendTo( $("<div>", {id: "num-cust-div"}) ).appendTo($display_container);

        $elements["top-custs-items"] = this.make_table(
            [gettext("Customer"), gettext("# of Items"),],
            data["top_customers_items"],
            "top-custs-items"
        );
        // $table.appendTo($display_container);

        $elements["top-custs-itemTypes"] = this.make_table(
            [gettext("Customer"), gettext("# of Item Types"),],
            data["top_customers_item_type"],
            "top-custs-itemTypes"
        );
        // $table.appendTo($display_container);

        $elements["top-item-count"] = this.make_table(
            [gettext("Item SKU"), gettext("# Items"),],
            data["top_item_count"],
            "top-item-count"
        );
        // $table.appendTo($display_container);

        return $elements;
    },

    make_table: function(header_arr, data_arrs, table_id) {
        var $table = $("<table>", {
                "class": 'table table-sm table-fit',
                id: table_id,
            }),
            i, j,
            arr_len, $tr_info;

        var $tr_head = $("<tr>").appendTo($table);
        for (i = 0; i < header_arr.length; i++) {
            $tr_head.append(
                $("<th>", {
                    text: header_arr[i],
                })
            );
        }

        for (i = 0; i < data_arrs.length; i++) {
            $tr_info = $("<tr></tr>").appendTo($table);
            var data_arr = data_arrs[i];
            for (j = 0; j < data_arr.length; j++) {
                $tr_info.append(
                    $("<td>", {text: data_arr[j]}),
                );
            }
        }
        return $table;
    },
};