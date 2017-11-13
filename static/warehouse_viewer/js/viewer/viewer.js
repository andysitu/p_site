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
        this.display_info(data);
    },
    display_info: function(data) {
        var $table,
            i,
            td_amount, tr_info;

        $("<p>", {"text": gettext("Total Number of Items") + ": " + data["total"],}).appendTo($display_container);
        $("<p>", {"text": gettext("Number of Item Types") + ": " + data["item_types"],}).appendTo($display_container);
        $("<p>", {"text": gettext("Number of Customers") + ": " + data["customers_num"],}).appendTo($display_container);

        // $table = $("<table class='table table-sm'></table>");
        // td_amount = data["top_item_count"].length;
        // $tr_info = null;
        //
        // $tr_head = $("<tr>").appendTo($table);
        // $tr_head.append(
        //     $("<th>Customer</th>"), $("<th>Items</th>"),
        //     $("<th>Customer</th>"), $("<th>Item Types</th>"),
        //     $("<th>Item SKU</th>"), $("<th>Count</th>"),
        // );
        //
        // for (i = 0; i < td_amount; i++) {
        //     $tr_info = $("<tr>").appendTo($table);
        //     $tr_info.append(
        //         $("<td>", {text: data["top_customers_items"][i][0],}),
        //         $("<td>", {text: data["top_customers_items"][i][1],}),
        //         $("<td>", {text: data["top_customers_item_type"][i][0],}),
        //         $("<td>", {text: data["top_customers_item_type"][i][1],}),
        //         $("<td>", {text: data["top_item_count"][i][0],}),
        //         $("<td>", {text: data["top_item_count"][i][1],}),
        //     );
        // }

        var header_arr = [gettext("Customer"), gettext("# of Items"),];
        $table = this.make_table(header_arr, data["top_customers_items"]);
        $table.appendTo($display_container);

        var header_arr = [gettext("Customer"), gettext("# of Item Types"),];
        $table = this.make_table(header_arr, data["top_customers_item_type"]);
        $table.appendTo($display_container);

        var header_arr = [gettext("Item SKU"), gettext("# Items"),];
        $table = this.make_table(header_arr, data["top_item_count"]);
        $table.appendTo($display_container);
    },

    make_table: function(header_arr, data_arrs) {
        console.log(data_arrs);
        var $table = $("<table class='table table-sm'></table>"),
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