var fd;

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

        var submit_button = document.querySelector("#submit-button");
        submit_button.addEventListener("click", function(e){
            e.preventDefault();

            var formData = new FormData(document.querySelector('#create-inv-form'));
            fd = formData;
            console.log(formData);
        });
}, false);

var inv_create = {

};


/**
 * Adds the item html table row element to #items-container.
 */
function add_item_ele(item_num) {
    var label_elem, label_text, input_elem;

    var items_container = document.querySelector("#items-table-body");

    var item_container = document.createElement("tr");
    
    // name input
    var name_container = document.createElement("td");

    input_elem = document.createElement("input");
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
    input_elem.setAttribute("type", "text");
    input_elem.classList.add("form-control");
    input_elem.setAttribute("name", "itemQuantity-" + item_num);
    input_elem.setAttribute("pattern", "\\d*");
    quantity_container.append(input_elem);

    // itemtype input
    var itemtype_container = document.createElement("td");

    var itemtype_input = document.createElement("input");
    itemtype_input.setAttribute("type", "text");
    itemtype_input.classList.add("form-control");
    itemtype_input.setAttribute("name", "itemType-" + item_num);
    
    itemtype_container.append(itemtype_input);

    // note input
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