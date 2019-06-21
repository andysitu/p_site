window.addEventListener("load", function() {
    search_inv.set_default_dates();

    search_inv.set_sort_table_listener();
    search_inv.add_search_btn_listener();
    search_inv.remove_search_item_listen();
    search_inv.search_btn_listener();
    search_inv.search_ajax();
});

var search_inv = {
    purchases_obj: null,
    num_add_items_filter:0,
    // Event Listener to sort tables by column clicked
    set_sort_table_listener() {
        var headers = document.querySelectorAll(".purchase-header-th");

        for (var i = 0; i < headers.length; i++) {
            headers[i].addEventListener("click", function(e) {
                var sort_category = e.target.getAttribute("value");

                // If it's been sorted before by this category
                if (search_inv.sort_category == sort_category) {
                    if (search_inv.ascending)
                        search_inv.ascending = false;
                    else
                        search_inv.ascending = true;
                } else {
                    search_inv.sort_category = sort_category
                    search_inv.ascending = true;
                }
                search_inv.display_purchase(
                    search_inv.sort_category, search_inv.ascending
                );
            })
        }
    },
    sort_category: null,
    ascending: false,

    set_default_dates() {
        var d = new Date();
        var month = d.getMonth(),
            year = d.getFullYear();

        var start_date = new Date(year, month-2, 1),
            end_date = new Date(year, month+1, 0);

        var start_date_select = document.getElementById("start-date-input"),
            end_date_select = document.getElementById("end-date-input");
        
        start_date_select.valueAsDate = start_date;
        end_date_select.valueAsDate = end_date;
    },
    search_btn_listener() {
        var search_button = document.getElementById("search-button");
        search_button.addEventListener("click", function(e){
            search_inv.clear_table();
            e.preventDefault();
            search_inv.search_ajax();

        });
    },
    add_search_btn_listener() {
        var btn = document.getElementById("add-search-item-btn");
        btn.addEventListener("click", function(e) {
            if (search_inv.num_add_items_filter < 5) {
                var div = ele_creator.create_add_search(
                    search_inv.fill_add_search, ++search_inv.num_add_items_filter);
                document.getElementById("add-search-container").append(div);
                search_inv.fill_add_search( 
                    "add-search-select-" + search_inv.num_add_items_filter, 
                    search_inv.num_add_items_filter
                );
            }
        });
    },
    remove_search_item_listen() {
        var del_search_item_btn = document.getElementById("del-search-item-btn");
        del_search_item_btn.addEventListener("click", function(e) {
            // Remove last item_search filter
            if (search_inv.num_add_items_filter > 0) {
                search_inv.num_add_items_filter--;
                var container = document.getElementById("add-search-container");
                container.removeChild(container.lastChild);
            }
        });
    },
    // Gets the filter parameters & returns a form data containing it
    // Returns null if there are multiple filters of one type
    get_form_search_data() {
        var start_date_select = document.getElementById("start-date-input"),
            end_date_select = document.getElementById("end-date-input");

        var fd = new FormData();
        fd.append("start_date", start_date_select.value);
        fd.append("end_date", end_date_select.value);

        // Check if there are multiple filter types
        var filter_count = {};

        var filter_type_prefix = "add-search-select-";
        var select;
        // Iterate thru the types of filters
        for (var i = 1; i <= this.num_add_items_filter; i++) {
            select = document.getElementById(filter_type_prefix + i);
            var filter_type = select.value;
            // Returns null since there are multiple
            if (filter_count[filter_type])
                return null;
            else {
                filter_count[filter_type] = 1;

                if (filter_type == "payment") {
                    var value = document.getElementById("payment-select").value;
                    fd.append("payment", value);
                } else if (filter_type == "vendor") {
                    var value = document.getElementById("vendor-input").value;
                    fd.append("vendor", value);
                } else if (filter_type == "department") {
                    var value = document.getElementById("department-select").value;
                    fd.append("department", value);
                } else if (filter_type == "total") {
                    var value = document.getElementById("total-modifier-select").value;
                    fd.append("total_modifier", value);

                    value = document.getElementById("total-input").value;
                    fd.append("total", value);
                } else if (filter_type == "order_number") {
                    var value = document.getElementById("order-number-input").value;
                    fd.append("order_number", value);
                } else if (filter_type == "item_name") {
                    var value = document.getElementById("item-name-input").value;
                    fd.append("item_name", value);
                } else if (filter_type == "item_type") {
                    var value = document.getElementById("item-type-input").value;
                    fd.append("item_type", value);
                }
            }
        }

        f = fd;
        return fd;
    },
    remove_purchases() {
        var purchase_tbody = document.getElementById("view-inv-tbody");
        while (purchase_tbody.firstChild) {
            purchase_tbody.removeChild(purchase_tbody.firstChild);
        }
    },
    display_purchase(sort_category="purchase_date", ascending=false) {
        var purchases_obj = search_inv.purchases_obj;

        search_inv.remove_purchases();

        var sorted_key;

        var id_value_obj = {};
        for (var id in purchases_obj) {
            id_value_obj[id] = purchases_obj[id][sort_category];
        }
        var values_sorted = Object.values(id_value_obj).sort(function(a_str,b_str) {
            var a = a_str.toLowerCase(),
                b = b_str.toLowerCase();
            if (ascending) {
                if (a < b)
                    return -1;
                else if (a > b)
                    return 1;
                else
                    return 0;
            } else {
                if (a > b)
                    return -1;
                else if (a < b)
                    return 1;
                else
                    return 0;
            }
        });

        var id, value;

        for (var i = 0; i < values_sorted.length; i++) {
            value = values_sorted[i];
            for (var id_str in id_value_obj) {
                if (id_value_obj[id_str] == value) {
                    id = parseInt(id_str);
                    add_row(purchases_obj, id);
                    delete id_value_obj[id];
                }
            }
        }

        console.log(purchases_obj);

        function add_row(purchases_obj, p_id) {
            var tr, td, p, item_container;
            var purchase_tbody = document.getElementById("view-purchases-table");

            p = purchases_obj[p_id];
            tr = document.createElement("tr");
            tr.setAttribute("id", "tr-" + p_id);
            tr.classList.add("table-active");
            tr.setAttribute("id", "tr-" + p_id);

            td = document.createElement("td");
            td.appendChild(document.createTextNode(p.vendor));
            td.setAttribute("id", "vendor-" + p_id);
            tr.append(td);

            td = document.createElement("td");
            td.appendChild(document.createTextNode(p.order_number));
            td.setAttribute("id", "order-number-" + p_id);
            tr.append(td);

            td = document.createElement("td");
            td.appendChild(document.createTextNode(p.total));
            td.setAttribute("id", "total-" + p_id);
            tr.append(td);

            td = document.createElement("td");
            td.appendChild(document.createTextNode(p.purchase_date));
            td.setAttribute("id", "purchase-date-" + p_id);
            tr.append(td);

            td = document.createElement("td");
            td.appendChild(document.createTextNode(p.payment));
            td.setAttribute("id", "payment-" + p_id);
            tr.append(td);

            td = document.createElement("td");
            td.appendChild(document.createTextNode(p.department));
            td.setAttribute("id", "department-" + p_id);
            tr.append(td);

            td = document.createElement("td");

            // Add delete btn
            var del_btn = document.createElement("button");
            del_btn.classList.add("btn");
            del_btn.classList.add("btn-danger");
            del_btn.append(document.createTextNode("Delete"));
            del_btn.setAttribute("id", "delete-btn-" + p_id);
            td.append(del_btn);

            del_btn.addEventListener("click", function(e){
                e.preventDefault();
                var re = /-(\d+)$/;
                // Save first captured string as ID
                var purchase_id = re.exec(e.target.id)[1];

                var answer = window.confirm("Are you sure you want to delete ID#" + purchase_id + "?");

                if (answer) {
                    var fd = new FormData();
                    fd.append("command", "delete");
                    fd.append("id", purchase_id);
                    
                    inv_ajax.postAjax(
                        search_inv_url, inv_ajax.get_csrf(), fd
                    ).then(function(json){
                        window.location.reload();
                    });    
                }
            });

            // add btn & EventListener for the Items
            if (Object.keys(p.items).length > 0) {
                // Create Buttons
                var view_items_btn = document.createElement("button");
                view_items_btn.classList.add("btn");
                view_items_btn.classList.add("btn-dark");
                view_items_btn.append(document.createTextNode("Items"));

                view_items_btn.setAttribute("id", "items-btn-" + p_id);

                td.append(view_items_btn);

                view_items_btn.addEventListener("click", function(e){
                    // Regedx to get id
                    var re = /-(\d+)$/;
                    // Save first captured string as ID
                    var purchase_id = re.exec(e.target.id)[1];
                    search_inv.show_items(purchase_id);
                });
            }

            // If pdf filt was submitted with purchase, show btn
            if (p.invoice) {
                var file_but = document.createElement("button");
                file_but.classList.add("btn");
                file_but.classList.add("btn-secondary");
                file_but.append(document.createTextNode("Invoice"));
                file_but.setAttribute("id", "download-btn-" + p_id);
                td.append(file_but);

                file_but.addEventListener("click", function(e){
                    var re = /-(\d+)$/;
                    // Save first captured string as ID
                    var purchase_id = re.exec(e.target.id)[1];

                    search_inv.download_file(purchase_id, e);
                });
            }
            
            tr.append(td);

            purchase_tbody.append(tr);

            item_container = document.createElement("tbody");
            item_container.setAttribute("id", "items-container-" + p_id);
            purchase_tbody.append(item_container);

            // Show items by default if there are any
            if (Object.keys(p.items).length > 0) {
                search_inv.show_items(p_id);
            }
        }
    },
    search_ajax() {
        var fd = this.get_form_search_data();

        if (fd) {
            // Search for the Results & then write to HTML Table
            inv_ajax.postAjax(
                search_inv_url, inv_ajax.get_csrf(), fd
            ).then(function(purchases_json) {
                var purchases_obj = JSON.parse(purchases_json);
                search_inv.purchases_obj = purchases_obj;
                search_inv.display_purchase();                
            });
        } else {
            window.alert("There are multiple search filter of one type. It needs to be removed.");
        }
    },
    download_file(purchase_id, e) {
        var fd = new FormData();
        fd.append("purchase_id", purchase_id);
        inv_ajax.postAjax(
            download_invoice_url, inv_ajax.get_csrf(), fd, true
        ).then(function(response){
            var order_number = document.getElementById(
                    "order-number-" + purchase_id).innerHTML,
                purchase_date = document.getElementById(
                    "purchase-date-" + purchase_id).innerHTML,
                vendor = document.getElementById(
                    "vendor-" + purchase_id).innerHTML;

            purchase_date = purchase_date.split("-").join("_");
            
            var filename = purchase_date + "_" + vendor + "_" + order_number + ".pdf";

            var blob = new Blob([response], {type: 'application/pdf' });
            var fr = new FileReader();
            fr.addEventListener("load", function(e) {
                var link = document.createElement('a');
                link.href = fr.result;
                link.setAttribute("target", "_blank");
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
            fr.readAsDataURL(blob);
        });
    },
    clear_table() {
        var tbody = document.getElementById("view-inv-tbody");
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
    },
    // Create the additional search options depending on what is selected
    fill_add_search(select_id, num_add_selects) {
        var select_ele = document.getElementById(select_id);
        var search_type = select_ele.value;
        var container = document.getElementById("add-search-container-" + num_add_selects);

        // Clear out container first of prev elements
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        if (search_type == "payment") {
            // Label for Payment Select
            var label = document.createElement("label");
            label.append(document.createTextNode("Payment"));
            label.setAttribute("for", "payment-select");
            container.append(label);

            // Payment Select
            var payment_select = document.createElement("select");
            payment_select.setAttribute("id", "payment-select");
            payment_select.classList.add("custom-select");
            payment_select.setAttribute("name", "payment");
            ele_creator.load_payments();
            
            container.append(payment_select);
        } else if (search_type == "order_number") {
            // Label for Order Number Input
            var label = document.createElement("label");
            label.append(document.createTextNode("Order Number"));
            label.setAttribute("for", "order-number-input");
            container.append(label);

            // Order Number Input
            var order_input = document.createElement("input");
            order_input.setAttribute("id", "order-number-input");
            order_input.classList.add("form-control");
            order_input.setAttribute("name", "order_number");
            
            container.append(order_input);
        } else if (search_type == "vendor") {
            // Label for Vendor Select
            var label = document.createElement("label");
            label.append(document.createTextNode("Vendor"));
            label.setAttribute("for", "vendor-input");
            container.append(label);

            // Vendor Select
            var vendor_input = document.createElement("input");
            vendor_input.setAttribute("type", "text");
            vendor_input.setAttribute("id", "vendor-input");
            vendor_input.classList.add("form-control");
            vendor_input.setAttribute("name", "vendor");
            
            container.append(vendor_input);
        } else if (search_type == "department") {
            // Label for Department Select
            var label = document.createElement("label");
            label.append(document.createTextNode("Department"));
            label.setAttribute("for", "department-select");
            container.append(label);

            // Department Select
            var department_select = document.createElement("select");
            department_select.setAttribute("id", "department-select");
            department_select.classList.add("custom-select");
            department_select.setAttribute("name", "department");
            ele_creator.load_departments();
            
            container.append(department_select);
        } else if (search_type == "total") {
            // Label for 

            // Label for Total Input
            var label = document.createElement("label");
            label.append(document.createTextNode("Total"));
            label.setAttribute("for", "total-input");
            container.append(label);

            var input_div = document.createElement("div");
            input_div.classList.add("input-group");

            // Modifier >=, <=, = select
            var modifier_select = document.createElement("select");
            modifier_select.classList.add("form-control");
            modifier_select.classList.add("col-sm-4");
            modifier_select.setAttribute("name", "total_modifier");
            modifier_select.setAttribute("id", "total-modifier-select");

            var option = document.createElement("option");
            option.append(document.createTextNode(">="));
            option.setAttribute("value", "gte");
            modifier_select.append(option);

            var option = document.createElement("option");
            option.append(document.createTextNode("<="));
            option.setAttribute("value", "lte");
            modifier_select.append(option);

            var option = document.createElement("option");
            option.append(document.createTextNode("="));
            option.setAttribute("value", "eq");
            modifier_select.append(option);

            input_div.append(modifier_select);

            var prepend_div = document.createElement("div");
            prepend_div.classList.add("input-group-prepend");

            var money_span = document.createElement("span");
            money_span.classList.add("input-group-text");
            money_span.appendChild(document.createTextNode("$"));

            // Total Input
            var total_input = document.createElement("input");
            total_input.setAttribute("id", "total-input");
            total_input.setAttribute("type", "number");
            total_input.setAttribute("step", "0.01");
            total_input.classList.add("form-control");
            total_input.setAttribute("name", "total");

            prepend_div.append(money_span);
            input_div.appendChild(prepend_div);
            input_div.appendChild(total_input);

            container.append(input_div);
        } else if (search_type == "item_name") {
            // Label for Order Number Input
            var label = document.createElement("label");
            label.append(document.createTextNode("Item Name"));
            label.setAttribute("for", "item-name-input");
            container.append(label);

            // Order Number Input
            var order_input = document.createElement("input");
            order_input.setAttribute("id", "item-name-input");
            order_input.classList.add("form-control");
            order_input.setAttribute("name", "item_name");
            
            container.append(order_input);
        } else if (search_type == "item_type") {
            // Label for Order Number Input
            var label = document.createElement("label");
            label.append(document.createTextNode("Item Type"));
            label.setAttribute("for", "item-type-input");
            container.append(label);

            // Order Number Input
            var order_input = document.createElement("input");
            order_input.setAttribute("id", "item-type-input");
            order_input.classList.add("form-control");
            order_input.setAttribute("name", "item_type");
            
            container.append(order_input);
        }
    },
    show_items(purchase_id) {
        var purchase_obj = search_inv.purchases_obj[purchase_id];
        
        // Get items container
        var items_container = document.getElementById(
            "items-container-" + purchase_id);
        // If there isn't items already there
        // Then append items
        if (items_container.childElementCount <= 0) {
            // Item Header
            var tr = ele_creator.create_item_header();
            items_container.append(tr);

            var items = purchase_obj.items;

            // Add Item Row
            for (var item_id in items) {
                var item_tr = ele_creator.create_item_row(items[item_id]);
                items_container.append(item_tr);
            }

        } else { // Remove the Items
            while(items_container.firstChild) {
                items_container.removeChild(items_container.firstChild);
            }
        }
    }
};

var ele_creator = {
    // Creates the tr header row for the items. Returns the TR Element
    create_item_header() {
        var tr = document.createElement("tr");
        tr.classList.add("table-primary");

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Name"));
        td.setAttribute("scope", "row");
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Amount"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Quantity"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Total"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Item Type"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Note"));
        tr.append(td);
        return tr;
    },
    // Creates the tr row for an item. Returns the TR element
    create_item_row(item_obj) {
        var tr = document.createElement("tr");
        tr.classList.add("table-light");

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.name));
        td.setAttribute("scope", "row");
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.amount));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.quantity));
        tr.append(td);

        var total = parseFloat(item_obj.amount) * parseInt(item_obj.quantity);
            
        td = document.createElement("td");
        td.appendChild(document.createTextNode(total.toFixed(2)));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.item_type));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.note));
        tr.append(td);
        return tr;
    },
    // Create Additional Search Inputs
    // num_add_selects - the # of select that this is. Use for appending to ID
    create_add_search(fill_add_search, num_add_selects) {
        var div = document.createElement("div");
        div.classList.add("form-group");
        div.classList.add("row");

        var add_type_div = document.createElement("div");
        add_type_div.classList.add("form-group");
        add_type_div.classList.add("col-md-2");
        // Add Type Label
        var add_type_label = document.createElement("label");
        add_type_label.append(document.createTextNode("Search Type"));
        add_type_div.append(add_type_label);

        var select_id = "add-search-select-" + num_add_selects;

        // Add Type Select
        var add_type_select = document.createElement("select");
        add_type_select.classList.add("custom-select");
        add_type_select.classList.add("add-search-select");
        add_type_select.setAttribute("id", select_id);

        // Change additional search filters if it's still there.
        if (fill_add_search) {
            add_type_select.addEventListener("change", function(e) {
                fill_add_search(e.target.id, num_add_selects);
            });
        }

        // Add the options
        var option = document.createElement("option");
        option.append(document.createTextNode("Payment"));
        option.setAttribute("value", "payment");
        add_type_select.append(option);

        option = document.createElement("option");
        option.append(document.createTextNode("Order Number"));
        option.setAttribute("value", "order_number");
        add_type_select.append(option);

        option = document.createElement("option");
        option.append(document.createTextNode("Vendor"));
        option.setAttribute("value", "vendor");
        add_type_select.append(option);

        option = document.createElement("option");
        option.append(document.createTextNode("Department"));
        option.setAttribute("value", "department");
        add_type_select.append(option);

        option = document.createElement("option");
        option.append(document.createTextNode("Total Amount"));
        option.setAttribute("value", "total");
        add_type_select.append(option);

        option = document.createElement("option");
        option.append(document.createTextNode("Item Name"));
        option.setAttribute("value", "item_name");
        add_type_select.append(option);

        option = document.createElement("option");
        option.append(document.createTextNode("Item Type"));
        option.setAttribute("value", "item_type");
        add_type_select.append(option);

        add_type_div.append(add_type_select);
        div.append(add_type_div);

        var options = {
            "payment": 0,
            "order_number": 0,
            "vendor": 0,
            "department": 0,
            "total": 0,
            "item_type": 0,
            "item_name": 0,
        };

        // Check if there are any other selects already created
        var prev_selects = document.getElementsByClassName("add-search-select");   
        var num_prev_selects = prev_selects.length;
 
        for (var i = 0; i < num_prev_selects; i++) {
            // Mark off options selected
            options[prev_selects[i].value] = 1;
        }

        // Choose an option not selected
        for (var option in options) {
            if (!options[option]) {
                add_type_select.value = option;
                break;
            }
        }

        var add_search_div = document.createElement("div");
        add_search_div.setAttribute("id", "add-search-container-" + num_add_selects);
        add_search_div.classList.add("form-group");
        add_search_div.classList.add("col-md-2");
        div.append(add_search_div);

        return div;
    },
    load_payments: function() {
        inv_ajax.getAjax(
            get_payment_url, inv_ajax.get_csrf()
        ).then(function(payments_json){
            var payments_obj = JSON.parse(payments_json);
            
            var payment_select = document.getElementById("payment-select");

            // Remove all the options in select
            while (payment_select.firstChild) {
                payment_select.removeChild(payment_select.firstChild);
            }

            var name, id;
            var payment_obj;
            var option;
            for (var id in payments_obj) {
                var option = document.createElement("option");
                payment_obj = payments_obj[id];

                name = payment_obj["name"];
                
                option.setAttribute("value", id);
                option.appendChild(document.createTextNode(name));

                payment_select.append(option);
            }
        });
    },
    load_departments: function() {
        inv_ajax.getAjax(
            get_department_url, inv_ajax.get_csrf()
        ).then(function(department_json){
            var depts_obj = JSON.parse(department_json);
            
            var dept_select = document.getElementById("department-select");

            // Remove all the options in select
            while (dept_select.firstChild) {
                dept_select.removeChild(dept_select.firstChild);
            }

            var name, id;
            var option;
            for (var id in depts_obj) {
                var option = document.createElement("option");
                dept_obj = depts_obj[id];

                name = dept_obj["name"];
                
                option.setAttribute("value", id);
                option.appendChild(document.createTextNode(name));

                dept_select.append(option);
            }
        });
    },
};