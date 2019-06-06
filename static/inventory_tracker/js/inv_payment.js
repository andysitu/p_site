window.addEventListener("load", function(e){
    // add click listener to add payment button
    (function (){
        var addPayment_button = document.getElementById("addPayment-button");
        addPayment_button.addEventListener("click", function(){
            var payment_name =window.prompt("Please enter a payment");
            var formData = new FormData();

            formData.append("payment_name", payment_name);
            inv_ajax.postAjax(
                submit_payment_url, inv_ajax.get_csrf(), formData
            ).then(function(json){
                inv_payment.build_payments();
            });
        });

        // Fills payments into table
        inv_payment.build_payments();
    })();
},false);

var inv_payment = {
     build_payments: function() {
        inv_ajax.getAjax(
            get_payment_url, inv_ajax.get_csrf()
        ).then(function(payments_json){
            var payment_tbody = document.getElementById("payment-tbody");
            var payments_obj = JSON.parse(payments_json);

            // Remove all child in tbody
            while (payment_tbody.firstChild) {
                payment_tbody.removeChild(payment_tbody.firstChild);
            }
            
            var paymentnum = 0,
                payment_name,
                payment_obj;

            var tr, th, th_text;

            for (var id in payments_obj) {
                payment_obj = payments_obj[id];
                payment_name = payment_obj["name"];
                tr = document.createElement("tr");

                // Payment #
                th = document.createElement("td");
                th_text = document.createTextNode(++paymentnum);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Payment ID
                th = document.createElement("td");
                th_text = document.createTextNode(id);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Payment Name
                th = document.createElement("td");
                th_text = document.createTextNode(payment_name);
                th.appendChild(th_text);

                tr.appendChild(th);

                payment_tbody.appendChild(tr);
            }
        });
    }
};