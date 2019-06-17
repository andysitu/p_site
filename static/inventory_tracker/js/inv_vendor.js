window.addEventListener("load", function(e){
    // add click listener to add payment button
    (function (){
        var addVendor_button = document.getElementById("addVendor-button");
        addVendor_button.addEventListener("click", function(){
            var formData = new FormData();

            var valid_vendor_name = false,
                valid_vendor_url = false;

            var vendor_name =window.prompt("Please enter a vendor name");
            if (vendor_name) {
                valid_vendor_name = true;
                formData.append("vendor_name", vendor_name);
            }

            var vendor_url = window.prompt("Please enter a vendor URL");
            if (vendor_url) {
                valid_vendor_url = true;
                formData.append("vendor_url", vendor_url);
            }
            
            if (valid_vendor_name && valid_vendor_url) {
                inv_ajax.postAjax(
                    submit_vendor_url, inv_ajax.get_csrf(), formData
                ).then(function(json){
                    inv_vendor.build_vendors();
                });
            }
        });

        // Fills payments into table
        inv_vendor.build_vendors();
    })();
},false);

var inv_vendor = {
     build_vendors: function() {
        inv_ajax.getAjax(
            get_vendor_url, inv_ajax.get_csrf()
        ).then(function(vendors_json){
            
            var vendor_tbody = document.getElementById("vendor-tbody");
            var vendors_obj = JSON.parse(vendors_json);

            // Remove all child in tbody
            while (vendor_tbody.firstChild) {
                vendor_tbody.removeChild(vendor_tbody.firstChild);
            }
            
            var vendornum = 0,
                vendor_name,
                vendor_url,
                vendor_obj;

            var tr, th, th_text;

            for (var id in vendors_obj) {
                vendor_obj = vendors_obj[id];

                vendor_name = vendor_obj["name"];
                vendor_url = vendor_obj["url"];
                tr = document.createElement("tr");

                // Vendor Num TD
                th = document.createElement("td");
                th_text = document.createTextNode(++vendornum);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Vendor Num ID
                th = document.createElement("td");
                th_text = document.createTextNode(id);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Vendor name TD
                th = document.createElement("td");
                th_text = document.createTextNode(vendor_name);
                th.appendChild(th_text);

                tr.appendChild(th);

                // Vendor URL TD
                th = document.createElement("td");
                th_text = document.createTextNode(vendor_url);
                th.appendChild(th_text);

                tr.appendChild(th);

                vendor_tbody.appendChild(tr);
            }
            
        });
    }
};