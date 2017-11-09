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
    "chart": chart,
    "display": function(data_mode, data_type, data) {
        console.log(data_mode, data_type, data);
        if (data_mode == "chart") {
            if (data_type == "total_item_count") {
                chart.display_info(data);
            }
        }
    },
};

var chart = {
    "display_info": function(data) {
        $("<p>", {"text": gettext("Total Number of Items") + ": " + data["total"],}).appendTo($display_container);
        $("<p>", {"text": gettext("Number of Item Types") + ": " + data["item_types"],}).appendTo($display_container);
        $("<p>", {"text": gettext("Number of Customers") + ": " + data["customers_num"],}).appendTo($display_container);

        var $table = $("<table>"), i, td_amount = data["total"].length;
        $tr_head = $("<tr>").appendTo($table);
        $tr_head.append(
            $("<th>Customer</th>"), $("<th>Items</th>"),
            $("<th>Customer</th>"), $("<th>Item Types</th>"),
            $("<th>Item SKU</th>"), $("<th>Count</th>"),
        );

        var $tr_info = null;
        for (i = 0; i < td_amount; i++) {
            $tr_info = $("<tr>").appendTo($table);
            $tr_info.append(
                $("<td>", {text: data["top_customers_items"]})
            );
        }

        $table.appendTo($display_container);
    },
};