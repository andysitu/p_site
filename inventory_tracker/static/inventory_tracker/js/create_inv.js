window.addEventListener('load',
    function(){
        // Set purchase date in the purchase date input to today by default
        (function set_purchase_date() {
            let today = new Date().toISOString().slice(0, 10);
            
            var purchase_date_elem = document.querySelector('#purchase-date-input');

            purchase_date_elem.value = today;
        })();

        var add_item_button = document.querySelector('#add-item-button');
        add_item_button.addEventListener("click", function(e){
            e.preventDefault();
            
        }, false);
}, false);