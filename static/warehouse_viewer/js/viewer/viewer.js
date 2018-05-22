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

    adv_contain_name: "adv_contain_select",
    data_select_id: "data-type-select",
    data_select_name: "data-type",
    date_select_1_id: "date-select-1",
    date_select_1_name: "date-1",
    date_select_2_id: "date-select-2",
    date_select_2_name: "date-2",
    filter_input_id: "filter-input",
    filter_input_name: "filter_value",
    filter_option_id: "filter-option-select",
    filter_option_name: "filter_option",
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
    single_date_select_id: "date-select",
    single_date_select_name: "date",
    time_period_input_id: "time-period-input",
    time_period_input_name: "time-period",
    quantity_item_type_id: "quantity-itemType-select",
    quantity_item_type_name: "quantity-item-type",
    quantity_input_id: "quantity-input",
    quantity_input_name: "quantity",
    quantity_modifier_name: "quantity-modifier",

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
        var $display_container = viewer.get_$display_container();
        $display_container.empty();
    },
    get_$display_container: function() {
        return $("#display-container");
    },
    get_display_content: function() {
        // Gets HTML content from Canvas if present and converts it
        //  image tags. Returns the HTML content in string form.
        var $canvas_search = $("#display-container > canvas"),
            content = "";

        var $disp_container = this.get_$display_container();
        content += $disp_container.html();

        if ($canvas_search.length != 0) {
            var image_url = $canvas_search[0].toDataURL("image/png"),
                i = "<img src='" + image_url + "'/>";
            var r = /\<canvas.*\/canvas\>/i;
            content = content.replace(r, i);
        }
        return content;
    },
    open_new_page: function(content) {
        console.log(content);
        var windowObject = window.open("", "_blank");
        windowObject.document.writeln(content);
        windowObject.document.close();
        windowObject.focus();
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
        } else if (data_type == "total_item_over_time" || data_type == "added_item_over_time" ||
                    data_type == "item_type_over_time" || data_type == "num_customers_over_time" ||
                    data_type == "items_shipped_over_time"
        ) {
            var $chart = chart.make_time_chart(data);
            $elements["total-item-over-time"] = $chart;
        } else if (data_type == "search") {
            var item_searcher = new Item_Searcher(data);
            var proc_data = item_searcher.data;
            var $table = this.make_data_table(item_searcher, proc_data);
            $elements["data-table"] = $table;
        } else if (data_type == "item_type_filter") {
            var sorted_empty_loc_arr = data["item-type-filter"];
            $elements["item-type-filter"] = this.make_location_table(
                // [gettext("Location"),],
                data["item-type-filter"],
                8,
                "item-type-filter-table"
            );
        }

        return $elements;
    },
    make_data_table: function(item_searcher_inst, proc_data, display_div_id) {
        if (display_div_id === undefined)
            display_div_id = "display-container";
        /**
         * Accepts a dictionary in the form of {[item_code] { [loc]: {item_data}}}
         * Makes table related to item_search.
         * Returns a $table displaying this data.
         */
        var $table = $("<table>", {
           "class": "table table-sm table-striped",
            id: "data-table"
        });

        var $tr, $th, item_data, i, hlen;

        var header_arr = [
            "Customer Code",
            "Item Code",
            "Location",
            "Description",
            "Available Quantity",
            "Shipped Quantity",
            "RCV",
        ],
        header_map = {
            "Customer Code": "customer_code",
            "Item Code": "item_code",
            "Location": "location",
            "Description": "description",
            "Available Quantity": "avail_quantity",
            "Shipped Quantity": "ship_quantity",
            "RCV": "rcv",
        },
        totals_dic = {
            "customer_code": {},
            "item_code": {},
            "location": {},
            "avail_quantity": 0,
            "ship_quantity": 0,
        };

        function add_to_total(item_data) {
            totals_dic["customer_code"][item_data.customer_code] = true
            totals_dic["item_code"][item_data.item_code] = true;
            totals_dic["location"][item_data.location] = true;
            totals_dic.avail_quantity += item_data.avail_quantity;
            totals_dic.ship_quantity += item_data.ship_quantity;
        }

        function total_dic_to_tablevalue(data_type) {
            switch(data_type) {
                case "customer_code":
                    return Object.keys(totals_dic["customer_code"]).length;
                case "item_code":
                    return Object.keys(totals_dic["item_code"]).length;
                case "location":
                    return Object.keys(totals_dic["location"]).length;
                case "avail_quantity":
                    return totals_dic.avail_quantity;
                case "ship_quantity":
                    return totals_dic.ship_quantity;
                default:
                    return "";
            }
        }


        var $thead = $("<thead>").appendTo($table);
        $tr = $("<tr>").appendTo($thead);

        hlen = header_arr.length

        for (i = 0; i < hlen; i++) {
            $th = $("<th>", {
                text: header_arr[i],
            })

            $th.click(function(e) {
                var th_name = e.target.textContent;
                var sorted_data = item_searcher_inst.sort_data(header_map[th_name]);
                console.log(sorted_data);
                $data_table = chart.make_data_table(item_searcher_inst, sorted_data);
                viewer.empty_page();
                $data_table.appendTo(("#" + display_div_id));
            });

            $tr.append($th);
        }

        var  header, hkey;

        var $tbody = $("<tbody>").appendTo($table);
        for (var itemsearch_id in proc_data) {
            $tr = $("<tr>").appendTo($tbody);
            item_data = proc_data[itemsearch_id];
            add_to_total(item_data);
            for (i = 0; i < hlen; i++) {
                header = header_arr[i];
                hkey = header_map[header];
                $tr.append($("<td>", {
                    text: item_data[hkey],
                }));
            }
        }

        $tr = $("<tr>").appendTo($tbody);
        for (i = 0; i < hlen; i++) {
            header = header_arr[i];
            hkey = header_map[header];
            $tr.append($("<td>", {
                text: total_dic_to_tablevalue(hkey),
            }));
        }

        return $table;
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

var Item_Searcher = class {
    constructor(raw_data) {
        this.proc_data = this.process_data(raw_data);
        this.sorted = null;
        this.ascending = false;
    }

    get data() {
        return this.proc_data;
    }

    process_data(raw_data) {
        var item_sku,
            location,
            items_dic,
            item_dic,
            proc_data = [];
        for (item_sku in raw_data) {
            items_dic = raw_data[item_sku]
            for (location in items_dic) {
                item_dic = items_dic[location];
                proc_data.push(item_dic);
            }
        }
        return proc_data;
    }

    sort_data(name) {

        if (this.sorted != name) {
            this.ascending = true;
        } else {
            this.ascending = !(this.ascending)
        }
        var ascending_status = this.ascending

        function compareFunction(a, b) {
            if (ascending_status) {
                var a_value = a[name],
                b_value = b[name];
            } else {
                var a_value = b[name],
                    b_value = a[name];
            }

            if (name == "location") {
                var re = /(\w+)\.(\w+)\.([A-Za-z]*)(\d+)\.(\d+)\.(\d+)/;

                var re_result_a = a_value.match(re),
                    re_result_b = b_value.match(re);

                var warehouse_location_a = re_result_a[1],
                    warehouse_location_b = re_result_b[1],
                    area_a = re_result_a[2],
                    area_b = re_result_b[2],
                    area_modifier_a = re_result_a[3],
                    area_modifier_b = re_result_b[3],
                    aisle_a = parseInt(re_result_a[4]),
                    aisle_b = parseInt(re_result_b[4]),
                    column_a = parseInt(re_result_a[5]),
                    column_b = parseInt(re_result_b[5]),
                    level_a = parseInt(re_result_a[6]),
                    level_b = parseInt(re_result_b[6]);

                if (warehouse_location_a > warehouse_location_b) {
                    return 1;
                } else if (warehouse_location_a < warehouse_location_b) {
                    return -1;
                } else {
                    if (area_a > area_b) {
                        return 1;
                    } else if (area_a < area_b) {
                        return -1;
                    } else {
                        if (area_modifier_a > area_modifier_b) {
                            return 1;
                        } else if (area_modifier_a < area_modifier_b) {
                            return -1;
                        } else {
                            if (aisle_a > aisle_b) {
                                return 1;
                            } else if (aisle_a < aisle_b) {
                                return -1;
                            } else {
                                if (column_a > column_b) {
                                    return 1;
                                } else if (column_a < column_b) {
                                    return -1;
                                } else {
                                    if (level_a > level_b) {
                                        return 1;
                                    } else if (level_a < level_b) {
                                        return -1;
                                    } else {
                                        return 0;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (a_value < b_value)
                    return -1;
                if (a_value > b_value)
                    return 1;
                return 0;
            }

        }

        this.sorted = name;
        this.proc_data = this.proc_data.sort(compareFunction);
        return this.proc_data;
    }
}