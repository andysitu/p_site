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

        var $side_bar = $("<div>", {
            id: "navigation-sidebar",
            "class": "right-sidebar col-sm-2 list-group",
        }).appendTo($("#body-div-row"));

        var $ul_side = $("<ul class='section-nav'></ul>");
        for (var ele_name in $elements_dic) {
            $elements_dic[ele_name].appendTo($display_container);
            var $li = $("<li class='sidebar-li'></li>").appendTo($ul_side);
            $("<a>", {
                href: "#" + ele_name,
                // "class": "list-group-item list-group-item-action",
                text: ele_name,
            }).appendTo($li);
        }
        $side_bar.append($ul_side);
    },
    display_info: function(data) {
        var $table,
            $elements = {};

        $elements["item-total"] = $("<p>", {
            "text": gettext("Total Number of Items") + ": " + data["item-total"],
            id: "item-total",
        });
        $elements["number-item-types"] = $("<p>", {
            "text": gettext("Number of Item Types") + ": " + data["number-item-types"],
            id: "number-item-types",
        });
        $elements["number-of-customers"] = $("<p>", {
            "text": gettext("Number of Customers") + ": " + data["number-of-customers"],
            id: "number-of-customers",
        });

        $elements["top-customers-by-items"] = this.make_table(
            [gettext("Customer"), gettext("# of Items"),],
            data["top-customers-by-items"],
            "top-customers-by-items"
        );

        $elements["top-customers-by-item-type"] = this.make_table(
            [gettext("Customer"), gettext("# of Item Types"),],
            data["top-customers-by-item-type"],
            "top-customers-by-item-type"
        );

        $elements["top-item-count"] = this.make_table(
            [gettext("Item SKU"), gettext("# Items"),],
            data["top-item-count"],
            "top-item-count"
        );

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