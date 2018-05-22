$( document ).ready(function(){
    $("#search-form").submit(function(e){
        e.preventDefault();
        side_menu.make_submitButton_loading();
        form_obj.submit();
    });

    // Add click event to print button
    $("#print-button").click(function(e){
        advsearch_viewer.print_search_results();
    });

    form_obj.create_form()
});

var advsearch_viewer = {
    get_display_container_id: function() {
        return "display-container";
    },
    get_$display_container: function() {
        return $("#display-container");
    },
    filter_results: function(form_data, data) {
        console.log(form_data);
        var i, form_length = form_data.length,
            search_quantity, qModifier, search_item_type,
            quantity, item_obj;

        for (i = 0; i < form_length; i++) {
            if (form_data[i].name == element_ids["quantity_input_name"]) {
                search_quantity = parseInt(form_data[i].value);
            } else if (form_data[i].name == element_ids["quantity_modifier_name"]) {
                qModifier = form_data[i].value;
            } else if (form_data[i].name == element_ids["quantity_item_type_name"]) {
                search_item_type = form_data[i].value;
            }
        }

        if (search_quantity != "") {
            var item_sku, loc;

            for (item_sku in data) {
                for (loc in data[item_sku] ) {
                    item_obj = data[item_sku][loc];

                    if (search_item_type == "avail_item") {
                        quantity = parseInt(item_obj["avail_quantity"]);
                    } else if (search_item_type == "ship_item") {
                        quantity = parseInt(item_obj["ship_quantity"]);
                    } else if (search_item_type == "total_item") {
                        quantity = parseInt(item_obj["avail_quantity"]) + parseInt(item_obj["ship_quantity"]);
                    }

                    if (qModifier == "eq") {
                        if (quantity != search_quantity)
                            delete data[item_sku][loc]
                    } else if (qModifier == "gte") {
                        if (!(quantity >= search_quantity))
                            delete data[item_sku][loc];
                    } else if (qModifier == "lte" ) {
                        if (!(quantity <= search_quantity))
                            delete data[item_sku][loc];
                    }
                }
            }
        }
        return data;
    },
    display_results: function(data_obj) {
        /**
         * receives results obj in format
         *  { [item_SKU(string)]: {
         *      [location(string)]: item_info_dictionary }}
         */
        var $disp_container = this.get_$display_container();

        $disp_container.empty();

        // Item_Search from viewer.js
        var item_searcher = new Item_Searcher(data_obj),
            proc_data = item_searcher.data,
            dispDiv_id = this.get_display_container_id();

        var $table = chart.make_data_table(item_searcher, proc_data, dispDiv_id);
        $disp_container.append($table);
    },
    print_search_results: function() {
        // Returns HTML from #display-container into string form
        //  into a new tab/window.
        var $disp_container = this.get_$display_container();

        var content = $disp_container.html();

        var windowObject = window.open("", "_blank");
        windowObject.document.writeln(content);
        windowObject.document.close();
        windowObject.focus();
    },
};

var form_obj = {
    submit: function() {
        // Submit function for the search form.
        var $form = this.get_$form(),
            form_data = {};

        form_data = $form.serializeArray();

        $.ajax({
            url: adv_search_url,
            data: form_data,
            success: function(data) {
                console.log(data);
                var filtered_data = advsearch_viewer.filter_results(form_data, data);
                advsearch_viewer.display_results(filtered_data);
                side_menu.renew_submitButton();
            },
        });
    },
    create_form: function() {
        this.add_filter_div();
        this.add_date_input();
        this.add_multiple_loc();
        this.add_quantity_input();
    },
    get_$form: function() {
        return $("#search-form");
    },
    get_$form_container: function() {
        return $("#form-container");
    },
    add_date_input: function() {
        var $form_container = this.get_$form_container();

        var $form_group = settings_maker.date_input_1();
        $form_group.addClass("col-md-2");
        $form_container.append( $form_group );
    },
    add_filter_div: function() {
        var $form_container = this.get_$form_container();
        var $form_group = settings_maker.adv_filter_div();
        $form_group.addClass("col-md-4");

        $form_container.append($form_group);
    },
    add_level_select: function() {
        var $form_container = this.get_$form_container(),
            $level_div = settings_maker.level_select();

        $level_div.addClass("col-md-3");

        $form_container.append($level_div);
    },
    add_multiple_loc: function() {
        var $form_container = this.get_$form_container();

        var $form_group = settings_maker.multiple_loc_select();
        $form_group.addClass("col-md-2");

        $form_container.append($form_group);
    },
    add_quantity_input: function() {
        var $form_container = this.get_$form_container(),
            $quantity_input = settings_maker.$quantity_input();

        $quantity_input.addClass("col-md-4");

        $form_container.append($quantity_input);

    },
};