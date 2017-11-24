var $display_container;

var viewer = {
    chart: chart,

    display: function(data_mode, data_type, data) {
        console.log(data_mode, data_type, data);

        this.empty_page();
        if (data_mode == "chart") {
            chart.create_page(data_type, data);
        }
    },
    empty_page: function() {
        $display_container.empty();
    }
};

var chart = {
    create_page: function(data_type, data) {
        var $elements_dic = this.display_info(data_type, data),
            div_name = null;

        // Display the side bar on the right for html navigation.
        var $side_bar = $("<div>", {
            id: "navigation-sidebar",
            "class": "right-sidebar col-sm-2 list-group",
        }).appendTo($display_container);

        var $ul_side = $("<ul class='section-nav'></ul>");
        for (var ele_name in $elements_dic) {
            $elements_dic[ele_name].appendTo($display_container);
            var $li = $("<li class='sidebar-li'></li>").appendTo($ul_side);
            $("<a>", {
                href: "#" + ele_name,
                text: ele_name,
            }).appendTo($li);
        }
        $side_bar.append($ul_side);
    },
    display_info: function(data_type, data) {
        var $table,
            $elements = {};

        if (data_type == "total_item_count") {
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

            $elements["item-count-by-loc"] = this.make_table(
                [gettext("Location"), gettext("# of Items"),],
                data["item-count-by-loc"],
                "item-count-by-loc"
            );

            $elements["item-type-by-loc"] = this.make_table(
                [gettext("Location"), gettext("# of Item Types"),],
                data["item-type-by-loc"],
                "item-type-by-loc"
            );


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
        } else if (data_type == "empty_locations") {
            var sorted_empty_loc_arr = data["empty-locations"];
            console.log(sorted_empty_loc_arr);
            $elements["empty-locations"] = this.make_location_table(
                // [gettext("Location"),],
                data["empty-locations"],
                8,
                "empty-locations-table"
            );
        }

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
    make_location_table: function(loc_arr, table_width, table_id) {
        loc_arr = loc_arr.sort()

        var $table = $("<table>", {
                "class": 'table table-sm table-fit',
                id: table_id,
            }),
            i,
            $tr_info,
            area, aisle,
            prev_area, prev_aisle,
            loc_code,
            num_items_row_count = 0,
            loc_re = /^USLA\.(\w)\.(\d{1,2})\./;

        for (i = 0; i < loc_arr.length; i++) {
            loc_code = loc_arr[i];

            re_results = loc_re.exec(loc_code)
            area = re_results[1];
            aisle = re_results[2];

            if (num_items_row_count > table_width) {
                $tr_info = $("<tr></tr>").appendTo($table);
                num_items_row_count = 1
            } else if (area != prev_area || aisle != prev_aisle) {
                prev_aisle = aisle;
                prev_area = area;
                $table.append(
                    $("<tr>").append(
                        $("<td>", {text: gettext("AREA: ") + area + gettext(", AISLE: ") + aisle})));
                $tr_info = $("<tr></tr>").appendTo($table);
                num_items_row_count = 1
            }
            $tr_info.append(
                $("<td>", {text: loc_code}),
            );

            num_items_row_count++;

        }
        return $table;
    },
};