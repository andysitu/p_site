window.addEventListener("load", function() {
    search_inv.set_default_dates();

    search_inv.search_btn_listener();
});

var search_inv = {
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

            console.log(purchases_obj);

            var purchase_tbody = document.getElementById("view-inv-tbody");
            
            var tr, td, p;

            for (var p_id in purchases_obj) {
                p = purchases_obj[p_id];
                tr = document.createElement("tr");
                
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
                if (p.invoice) {
                    var file_link = document.createElement("button");
                    file_link.classList.add("btn");
                    file_link.classList.add("btn-secondary");
                    file_link.append(document.createTextNode("Download"));
                    td.append(file_link);

                    file_link.addEventListener("click", function(e){
                        search_inv.download_file(p.id);
                    });
                }
                tr.append(td);

                purchase_tbody.append(tr);
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
            console.log(response);
            console.log(link);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
};