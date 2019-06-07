var fd;

window.addEventListener('load',
    function(){
        // Set purchase date in the purchase date input to today by default
        (function set_purchase_date() {
            let today = new Date().toISOString().slice(0, 10);
            
            var purchase_date_elem = document.querySelector('#purchase-date-input');

            purchase_date_elem.value = today;
        })();

        inv_create.load_form_data();

        var add_item_button = document.querySelector('#add-item-button');
        add_item_button.addEventListener("click", function(e){
            e.preventDefault();
            inv_create.add_item_ele();
        }, false);

        var del_item_button = document.querySelector('#del-item-button');
        del_item_button.addEventListener("click", function(e){
            e.preventDefault();
            inv_create.remove_item();
        }, false);

        /* Use default HTML Submit
        var submit_button = document.querySelector("#submit-button");
        submit_button.addEventListener("submit", function(e){
            var formData = new FormData(document.querySelector('#create-inv-form'));
            fd = formData;
            fd.append("number_items", this.num_items);
            console.log(formData);
        });
        */
}, false);

var inv_create = {
    num_items: 0,
    load_form_data: function() {
        this.load_payments();
        this.load_vendors();
        this.load_departments();
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
    load_vendors: function() {
        inv_ajax.getAjax(
            get_vendor_url, inv_ajax.get_csrf()
        ).then(function(vendors_json){
            var vendors_obj = JSON.parse(vendors_json);
            
            var vendor_select = document.getElementById("vendor-select");

            // Remove all the options in select
            while (vendor_select.firstChild) {
                vendor_select.removeChild(vendor_select.firstChild);
            }

            var name, id;
            var vendor_obj;
            var option;
            for (var id in vendors_obj) {
                var option = document.createElement("option");
                vendor_obj = vendors_obj[id];

                name = vendor_obj["name"];
                
                option.setAttribute("value", id);
                option.appendChild(document.createTextNode(name));

                vendor_select.append(option);
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
            var vendor_obj;
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
    /**
     * Adds the item html table row element to #items-container.
     */
     add_item_ele: function() {
        this.num_items++;
        var numItems_input = document.querySelector("#num-items-input");
        numItems_input.setAttribute("value", this.num_items);

        var item_num = this.num_items;

        var label_elem, label_text, input_elem;

        var items_container = document.querySelector("#items-table-body");

        var item_container = document.createElement("tr");
        
        // name input
        var name_container = document.createElement("td");

        input_elem = document.createElement("input");
        input_elem.setAttribute("required", "");
        input_elem.setAttribute("id", "name-input-" + item_num);
        input_elem.setAttribute("type", "text");
        input_elem.classList.add("form-control");
        input_elem.setAttribute("name", "itemName-" + item_num);
        name_container.append(input_elem);

        // amount input
        var amount_container = document.createElement("td");

        var input_div = document.createElement("div");
        input_div.classList.add("input-group");

        var prepend_div = document.createElement("div");
        prepend_div.classList.add("input-group-prepend");

        var money_span = document.createElement("span");
        money_span.classList.add("input-group-text");
        money_span.appendChild(document.createTextNode("$"));

        input_elem = document.createElement("input");
        input_elem.setAttribute("required", "");
        input_elem.setAttribute("id", "amount-input-" + item_num);
        input_elem.setAttribute("type", "number");
        input_elem.classList.add("form-control");
        input_elem.setAttribute("name", "itemAmount-" + item_num);

        prepend_div.append(money_span);
        input_div.appendChild(prepend_div);
        input_div.appendChild(input_elem);

        amount_container.append(input_div);

        // quantity input
        var quantity_container = document.createElement("td");

        input_elem = document.createElement("input");
        input_elem.setAttribute("required", "");
        input_elem.setAttribute("id", "quantity-input-" + item_num);
        input_elem.setAttribute("type", "text");
        input_elem.classList.add("form-control");
        input_elem.setAttribute("name", "itemQuantity-" + item_num);
        input_elem.setAttribute("pattern", "\\d*");
        quantity_container.append(input_elem);

        // itemtype input
        var itemtype_container = document.createElement("td");

        input_elem = document.createElement("input");
        input_elem.setAttribute("required", "");
        input_elem.setAttribute("id", "type-input-" + item_num);
        input_elem.setAttribute("type", "text");
        input_elem.classList.add("form-control");
        input_elem.setAttribute("name", "itemType-" + item_num);
        
        itemtype_container.append(input_elem);

        // note input
        var note_container = document.createElement("td");

        input_elem = document.createElement("input");
        input_elem.setAttribute("id", "note-input-" + item_num);
        input_elem.setAttribute("type", "text");
        input_elem.classList.add("form-control");
        input_elem.setAttribute("name", "itemNote-" + item_num);
        note_container.append(input_elem);

        item_container.append(name_container);
        item_container.append(amount_container);
        item_container.append(quantity_container);
        item_container.append(itemtype_container);
        item_container.append(note_container);

        items_container.appendChild(item_container);
    },
    remove_item() {
        var items_container = document.querySelector("#items-table-body");
        if (this.num_items > 0) {
            this.num_items--;

            var numItems_input = document.querySelector("#num-items-input");
            numItems_input.setAttribute("value", this.num_items);

            items_container.removeChild(items_container.lastChild);
        }
    },
};

