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
        var $table = $("<table>", {
            "class": "table",
        }).appendTo($display_container);

        var $tr_item_total = $("<tr>").appendTo($table);
        $("<td>", {"text": gettext("Total Number of Items"),}).appendTo($tr_item_total);
        $("<td>", {"text": data["total"],}).appendTo($tr_item_total);

        var $tr_item_types = $("<tr>").appendTo($table);
        $("<td>", {"text": gettext("Number of Item Types"),}).appendTo($tr_item_types);
        $("<td>", {"text": data["item_types"],}).appendTo($tr_item_types);

        var $tr_cnum = $("<tr>").appendTo($table);
        $("<td>", {"text": gettext("Number of Customers"),}).appendTo($tr_cnum);
        $("<td>", {"text": data["customers_num"],}).appendTo($tr_cnum);
    },
};