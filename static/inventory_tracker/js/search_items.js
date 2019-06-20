window.addEventListener("load", function() {
    search_items.add_search_btn_listener();
});

var search_items = {
    items: null,
    add_search_btn_listener() {
        var search_btn = document.getElementById("search-button");

        search_btn.addEventListener("click", function(e){ 
            e.preventDefault();

            var item_name = document.getElementById("item-name-input").value,
                item_type = document.getElementById("item-type-input").value;

            if (item_name || item_type) {
                var fd = new FormData();
                if (item_name) {
                    fd.append("item_name", item_name);
                }
                if (item_type) {
                    fd.append("item_type", item_type);
                }

                inv_ajax.postAjax(
                    search_items_url, inv_ajax.get_csrf(), fd
                ).then(function(json){
                    search_items.items = JSON.parse(json);
                    search_items.add_items();
                });
            }
        });
    },
    add_items() {
        var items = this.items;
        var items_container = document.getElementById("view-inv-tbody");

        while (items_container.firstChild) {
            items_container.removeChild(items_container.firstChild);
        }

        var tr, item_obj;
        for (var item_id in items) {
            item_obj = items[item_id];
            tr = document.createElement("tr");

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

            items_container.append(tr);
        }
    }
};