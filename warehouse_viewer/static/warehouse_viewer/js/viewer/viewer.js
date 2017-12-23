// ONLY THE DISPLAY COMPONENT, LET LOGIC GO IN
// VIEWER_PROCESSOR

// $display_container is pointed to the actual display_container
//  in load_viewer.js
var $display_container;

var element_ids = {
    main_navbar_id: "main-navbar",
    sidebar_nav_id: "sidebar-nav-div",

    menu_container_id: "mode-settings-div",
    display_container_id: "display-container",

    data_select_id: "data-type-select",
    data_select_name: "data-type",
    date_select_1_id: "date-select-1",
    date_select_1_name: "date-1",
    loc_select_name: "loc",
    loc_select_id: "loc-select",
    level_container_id: "level-container",
    level_modifier: "level-modifier",
    level_select_id: "level-select",
    level_select_name: "level",
    options_container_id: "options-container",
    mutiple_dates_select_id: "multiple-dates-select",
    mutiple_dates_select_name: "dates",
    multiple_loc_select_id: "multiple-loc-select",
    multiple_loc_select_name: "locs",
    num_item_type_input_id: "item-type-input-id",
    num_item_type_input_name: "num-item-types",
    num_item_type_modifier: "num-item-type-modifier",
    time_period_input_id: "time-period-input",
    time_period_input_name: "time-period",

    // For Chart.js
    total_item_over_time_chart: "item-over-time-chart",

    // For Map
    msg_div: "display-msg-div",
    msg_text_div: "display-msg-text",
};

var viewer = {
    chart: chart,

    display: function(data_mode, data_type, data, form_data) {
        this.empty_page();
        if (data_mode == "map") {
            map_processor.start(data_type, data, form_data);
        } else if (data_mode == "chart") {
            chart.create_page(data_type, data);
        }
    },
    empty_page: function() {
        $display_container.empty();
    },
    get_$display_container: function() {
        return $("#display-container");
    },
};

var chart = {
    create_page: function(data_type, data) {
        var $elements_dic = this.display_info(data_type, data),
            div_name = null;

        for (var ele_name in $elements_dic) {
            $elements_dic[ele_name].appendTo($display_container);
        }
    },
    display_info: function(data_type, data) {
        var $table,
            $elements = {};

        if (data_type == "total_item_info") {
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
        } else if (data_type == "item_type_filter") {
            var sorted_empty_loc_arr = data["item-type-filter"];
            $elements["item-type-filter"] = this.make_location_table(
                // [gettext("Location"),],
                data["item-type-filter"],
                8,
                "item-type-filter-table"
            );
        } else if (data_type == "total_item_over_time") {
            var $chart = chart.make_time_chart(data);
            $elements["total-item-over-time"] = $chart;
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
        var $table = $("<table>", {
                "class": 'table table-sm table-fit',
                id: table_id,
            }),
            i,
            $tr_info,
            area, aisle, loc_code,
            prev_area, prev_aisle, prev_column,
            num_items_row_count = 0,
            loc_re = /^USLA\.(\w+)\.(\d+)\.(\d+)\./;

        for (i = 0; i < loc_arr.length; i++) {
            loc_code = loc_arr[i];

            re_results = loc_re.exec(loc_code)
            area = re_results[1];
            aisle = re_results[2];
            column = re_results[3];

            if (num_items_row_count > table_width) {
                $tr_info = $("<tr></tr>").appendTo($table);
                num_items_row_count = 1
            } else if (area != prev_area || aisle != prev_aisle) {
                prev_aisle = aisle;
                prev_area = area;
                prev_column = column;
                $table.append(
                    $("<tr>", {"class": "table-primary",}).append(
                        $("<td>", {text: gettext("AREA: ") + area,}),
                        $("<td>", {text: gettext("AISLE: ") + aisle,}),
                    ));
                $tr_info = $("<tr></tr>").appendTo($table);
                num_items_row_count = 1
            } else if (prev_column != column) {
                $tr_info = $("<tr></tr>").appendTo($table);
                prev_column = column;

                num_items_row_count = 1

            }
            $tr_info.append(
                $("<td>", {text: loc_code}),
            );

            num_items_row_count++;
        }
        return $table;
    },
    make_time_chart: function(time_data_dic) {
        var $canvas = $("<canvas />",{
                id: element_ids.total_item_over_time_chart,
            }),
            ctx = $canvas[0].getContext('2d'),
            labels_arr = [],
            data_arr,
            i;

        var milliseconds,
            dataset_arr = [],
            first_loc = Object.keys(time_data_dic)[0]
            milliseconds_arr = Object.keys(time_data_dic[first_loc]).sort(),
            milliseconds_length = milliseconds_arr.length;

        var colors = {
            "All": "rgb(255, 99, 132)",
            "S": "rgb(54, 162, 235)",
            "P": "rgb(75, 192, 192)",
            "F": "rgb(255, 159, 64)",
            "VC": "rgb(153, 102, 255)",
        }

        for (i = 0; i < milliseconds_length; i++) {
            milliseconds = milliseconds_arr[i];
            labels_arr.push(new Date(parseFloat(milliseconds)));
        }

        for (var loc in time_data_dic) {
            data_arr = [];
            for (i = 0; i < milliseconds_length; i++) {
                milliseconds = milliseconds_arr[i];
                data_arr.push(time_data_dic[loc][milliseconds]);
            }

            dataset_arr.push({
                backgroundColor: colors[loc],
                borderColor: colors[loc],
                fill: false,
                label: loc,
                data: data_arr,
            });
        }

        var data = {
            labels: labels_arr,
            datasets: dataset_arr,
        }

        var chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                tooltips: {
                    mode: "index",
                    intersect: false,
                },
                hover: {
                    mode: "nearest",
                    intersect: true,
                },
                scales: {
                    xAxes: [{
                        type: "time",
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: gettext("Date"),
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: gettext("Total Number of Items"),
                        },
                        ticks: {
                            beginAtZero: true,
                        }
                    }],
                },
            }
        });

        return $canvas;
    },
};