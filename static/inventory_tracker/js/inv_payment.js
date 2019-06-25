window.addEventListener("load", function(e){
    // add click listener to add payment button
    (function (){
        var addPayment_button = document.getElementById("addPayment-button");
        addPayment_button.addEventListener("click", function(){

            var payment_name =window.prompt("Please enter a payment");

            if (payment_name) {
                var formData = new FormData();
                formData.append("command", "create");
                formData.append("payment_name", payment_name);
                inv_ajax.postAjax(
                    submit_payment_url, inv_ajax.get_csrf(), formData
                ).then(function(json){
                    inv_payment.build_payments();
                });
            } else {
                window.alert("Payment was blank.");
            }
            
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
                td = document.createElement("td");
                td_text = document.createTextNode(++paymentnum);
                td.appendChild(td_text);

                tr.appendChild(td);

                // Payment ID
                td = document.createElement("td");
                td_text = document.createTextNode(id);
                td.appendChild(td_text);

                tr.appendChild(td);

                // Payment Name
                td = document.createElement("td");
                td_text = document.createTextNode(payment_name);
                td.appendChild(td_text);

                tr.appendChild(td);

                // Delete & Edit Button
                td = document.createElement("td");

                var edit_btn = document.createElement("button");
                edit_btn.classList.add("btn");
                edit_btn.classList.add("btn-secondary");
                edit_btn.append(document.createTextNode("Edit"));

                edit_btn.addEventListener("click", inv_payment.edit_listener);

                edit_btn.setAttribute("id", "edit-btn-" + id);

                td.append(edit_btn);

                var del_btn = document.createElement("button");
                del_btn.classList.add("btn");
                del_btn.classList.add("btn-danger");
                del_btn.append(document.createTextNode("Delete"));

                del_btn.addEventListener("click", inv_payment.delete_listener);

                del_btn.setAttribute("id", "del-btn-" + id);

                td.append(del_btn);

                tr.appendChild(td);

                payment_tbody.appendChild(tr);
            }
        });
    },
    edit_listener(e) {
        // Regedx to get id
        var re = /-(\d+)$/;
        // Save first captured string as ID
        var payment_id = re.exec(e.target.id)[1];

        var payment = window.prompt("Payment name? Leave blank for unchanged");

        if (payment && payment.length <= 50) {
            var fd = new FormData();
            fd.append("command", "edit");
            fd.append("id", payment_id);
            
            fd.append("payment_name", payment);
            inv_ajax.postAjax(
                submit_payment_url, inv_ajax.get_csrf(), fd
            ).then(function(json){
                window.location.reload();
            });
        }
    },
    delete_listener(e) {
        // Regedx to get id
        var re = /-(\d+)$/;
        // Save first captured string as ID
        var payment_id = re.exec(e.target.id)[1];

        var answer = window.confirm("Are you sure you want to delete ID#" + payment_id + "?");
        
        if (answer) {
            var fd = new FormData();
            fd.append("command", "delete");
            fd.append("id", payment_id);
            
            inv_ajax.postAjax(
                submit_payment_url, inv_ajax.get_csrf(), fd
            ).then(function(json){
                window.location.reload();
            });
        }
    },
};