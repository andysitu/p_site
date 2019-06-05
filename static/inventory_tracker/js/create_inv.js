window.addEventListener('load',
    function(){
        // Set purchase date in the purchase date input to today by default
        (function set_purchase_date() {
            let today = new Date().toISOString().slice(0, 10);
            
            var purchase_date_elem = document.querySelector('#purchase-date-input');

            purchase_date_elem.value = today;
        })();

        var item_num = 0;

        var add_item_button = document.querySelector('#add-item-button');
        add_item_button.addEventListener("click", function(e){
            e.preventDefault();
            add_item_ele(++item_num);
        }, false);
}, false);

/**
 * Adds the item container element to #items-container.
 * Allows user to
 */
function add_item_ele(item_num) {
    var label_elem, label_text, input_elem;

    var items_container = document.querySelector("#items-table-body");

    var item_container = document.createElement("tr");
    
    // name, amount, quantity, note, item_type

    var name_container = document.createElement("td");

    input_elem = document.createElement("input");
    input_elem.setAttribute("type", "text");
    input_elem.classList.add("form-control");
    input_elem.setAttribute("name", "itemName-" + item_num);
    name_container.append(input_elem);

    var amount_container = document.createElement("td");

    input_elem = document.createElement("input");
    input_elem.setAttribute("type", "number");
    input_elem.classList.add("form-control");
    input_elem.setAttribute("name", "itemAmount-" + item_num);
    amount_container.append(input_elem);

    var quantity_container = document.createElement("td");

    input_elem = document.createElement("input");
    input_elem.setAttribute("type", "text");
    input_elem.classList.add("form-control");
    input_elem.setAttribute("name", "itemQuantity-" + item_num);
    input_elem.setAttribute("pattern", "\\d*");
    quantity_container.append(input_elem);

    var itemtype_container = document.createElement("td");

    var itemtype_sel = document.createElement("select");
    itemtype_sel.classList.add("custom-select");
    itemtype_sel.setAttribute("name", "itemType-" + item_num);
    
    itemtype_container.append(itemtype_sel);

    var note_container = document.createElement("td");

    input_elem = document.createElement("input");
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
}

