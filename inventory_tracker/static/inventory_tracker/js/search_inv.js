window.addEventListener("load", function() {
    search_inv.set_default_dates();

    search_inv.search_btn_listener();
    search_inv.search_ajax();
});

var search_inv = {
    purchases_obj: null,

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
    add_search_item_listener() {
        var add_search_item_btn = document.getElementById("add-search-item-btn");
        add_search_item_btn.addEventListener("click", function(){
        });
    },
    search_btn_listener() {
        var search_button = document.getElementById("search-button");
        search_button.addEventListener("click", function(e){
            e.preventDefault();
            search_inv.search_ajax();
        });
    },
    search_ajax() {
        var start_date_select = document.getElementById("start-date-input"),
            end_date_select = document.getElementById("end-date-input");

        var fd = new FormData();
        fd.append("start_date", start_date_select.value);
        fd.append("end_date", end_date_select.value);

        inv_ajax.postAjax(
            search_inv_url, inv_ajax.get_csrf(), fd
        ).then(function(purchases_json) {
            var purchases_obj = JSON.parse(purchases_json);

            search_inv.purchases_obj = purchases_obj;

            console.log(purchases_obj);

            var purchase_tbody = document.getElementById("view-inv-tbody");
            
            var tr, td, p, item_container;

            // Add Purchases to the table
            for (var p_id in purchases_obj) {
                p = purchases_obj[p_id];
                tr = document.createElement("tr");
                tr.setAttribute("id", "tr-" + p_id);

                td = document.createElement("td");
                td.appendChild(document.createTextNode(p.order_num));
                tr.append(td);

                td = document.createElement("td");
                td.appendChild(document.createTextNode(p.total));
                tr.append(td);

                td = document.createElement("td");
                td.appendChild(document.createTextNode(p.purchase_date));
                tr.append(td);

                td = document.createElement("td");
                td.appendChild(document.createTextNode(p.payment));
                tr.append(td);
                
                td = document.createElement("td");
                td.appendChild(document.createTextNode(p.vendor));
                tr.append(td);

                td = document.createElement("td");
                td.appendChild(document.createTextNode(p.department));
                tr.append(td);

                td = document.createElement("td");

                // add EventListener for the Items
                if (Object.keys(p.items).length > 0) {
                    var view_items_btn = document.createElement("button");
                    view_items_btn.classList.add("btn");
                    view_items_btn.classList.add("btn-secondary");
                    view_items_btn.append(document.createTextNode("View Items"));

                    view_items_btn.setAttribute("id", "items-btn-" + p_id);

                    td.append(view_items_btn);

                    view_items_btn.addEventListener("click", function(e){
                        // Regedx to get id
                        var re = /-(\d+)$/;
                        // Save first captured string as ID
                        var purchase_id = re.exec(e.target.id)[1];
                        var purchase_obj = search_inv.purchases_obj[purchase_id];
                        
                        // Get items container
                        var items_container = document.getElementById(
                            "items-container-" + purchase_id);
                        // If there isn't items already there
                        // Then append items
                        if (items_container.childElementCount <= 0) {
                            // Item Header
                            var tr = search_inv.create_item_header();
                            items_container.append(tr);

                            var items = purchase_obj.items;

                            // Add Item Row
                            for (var item_id in items) {
                                var item_tr = search_inv.create_item_row(items[item_id]);
                                items_container.append(item_tr);
                            }

                        } else { // Remove the Items
                            while(items_container.firstChild) {
                                items_container.removeChild(items_container.firstChild);
                            }
                        }
                    });
                }

                if (p.invoice) {
                    var file_but = document.createElement("button");
                    file_but.classList.add("btn");
                    file_but.classList.add("btn-secondary");
                    file_but.append(document.createTextNode("Download"));
                    td.append(file_but);

                    file_but.addEventListener("click", function(e){
                        search_inv.download_file(p.id);
                    });
                }
                tr.append(td);

                purchase_tbody.append(tr);

                item_container = document.createElement("div");
                item_container.setAttribute("id", "items-container-" + p_id);
                purchase_tbody.append(item_container);
            }
        });
    },
    download_file(purchase_id, filename) {
        var fd = new FormData();
        fd.append("purchase_id", purchase_id);
        inv_ajax.postAjax(
            download_invoice_url, inv_ajax.get_csrf(), fd, true
        ).then(function(response){
            var blob = new Blob([response], {type: 'application/pdf' });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute("target", "_blank");
            link.download = "test.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    },

    // Creates the tr header row for the items. Returns the TR Element
    create_item_header() {
        var tr = document.createElement("tr");
        tr.classList.add("table-primary");

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Name"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Amount"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Quantity"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Item Type"));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode("Note"));
        tr.append(td);
        return tr;
    },
    create_item_row(item_obj) {
        var tr = document.createElement("tr");
        tr.classList.add("table-secondary");

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.name));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.amount));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.quantity));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.item_type));
        tr.append(td);

        td = document.createElement("td");
        td.appendChild(document.createTextNode(item_obj.note));
        tr.append(td);
        return tr;
    }
};