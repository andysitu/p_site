class TrackingList {
    // Class to display tracking numbers inputted.
    constructor(container_id, get_data_url, io_controller) {
        this.trackingNum_htmlElements = {}

        this.container_id = container_id;
        this.div_id = "tracking-list-div";
        this.get_data_url = get_data_url;
        this.tbody_id = "tracking-tbody";

        this.io_controller_ref = io_controller;

        this.JS2Django_heading_map = {
            "Tracking Number": "tracking_number",
            "Options": "",
            "Input Date": "input_date",
            "Type": "type",
        };

        this.load();
    }

    load() {
        this.get_tracking_data();
    }

    show_tracking_data(all_trackingInfo_dict) {
        var that = this;

        var container_element = that.container;

        that.make_tracking_list(all_trackingInfo_dict);
    }

    get container() {
        return document.getElementById(this.container_id); }

    get_tracking_data() {
        this.io_controller_ref.get_tracking_data(
            this.get_data_url,
            this.show_tracking_data.bind(this));
    }

    make_tracking_list(trackingInfo_dic) {
        var containerEle = this.container;

        var tableEle = document.createElement("table");
        
        // tableEle.classList.add("table");
        tableEle.classList.add("table-hover");

        var threadEle = document.createElement("thead"),
            tbodyEle = document.createElement("tbody"),
            heading_tr,
            th, td;

        tbodyEle.setAttribute("id", this.tbody_id);

        var JS2Django_heading_map = this.JS2Django_heading_map,
            th_list = Object.keys(JS2Django_heading_map);

        heading_tr = this.create_heading_tr();
        threadEle.appendChild(heading_tr);

        tableEle.appendChild(threadEle);
        tableEle.appendChild(tbodyEle);
        containerEle.appendChild(tableEle);

        for (let id in trackingInfo_dic) {
            let tracking_dic = trackingInfo_dic[id];
            this.add_tracking_num(id, tracking_dic, true);
        }
    }

    add_tracking_num(id, tracking_dic, addToTop = true) {
        var tbody = document.getElementById(this.tbody_id),
            tracking_tr = this.create_tracking_tr(id,tracking_dic);

        this.trackingNum_htmlElements[id] = tracking_tr;

        if (addToTop) {
            tbody.insertBefore(tracking_tr, tbody.firstChild);
        } else {
            tbody.appendChild(tracking_tr);
        }
        
    }

    create_heading_tr() {
        function create_th(text) {
            let th = document.createElement("th");
            th.setAttribute("scope", "col");
            th.appendChild(document.createTextNode(text));
            return th;
        }

        var JS2Django_heading_map = this.JS2Django_heading_map,
            th_list = Object.keys(JS2Django_heading_map),
            tr, th;

        tr = document.createElement("tr");
        for (let i = 0; i < th_list.length; i++) {

            tr.appendChild( create_th(th_list[i]) );
        }
        return tr;
    }
    create_tracking_tr(tracking_num_id, tracking_dic) {
        var JS2Django_heading_map = this.JS2Django_heading_map,
            th_list = Object.keys(JS2Django_heading_map);
            
        var tr = document.createElement("tr"),
            td;
            
        for (let i = 0; i < th_list.length; i++) {
            var value;
            td = document.createElement("td");
            
            let heading_name = th_list[i];
            let py_heading_name = JS2Django_heading_map[heading_name];
            if (heading_name != "Options") {
                value = tracking_dic[py_heading_name];
                td.appendChild(document.createTextNode(value));
            } else {
                var close_button = document.createElement("a");

                close_button.href="";

                close_button.innerHTML = "&#10006";

                close_button.addEventListener("click", function(e) {
                   e.preventDefault();
                   io.delete(tracking_num_id);
                });

                td.appendChild(close_button);
            }
            tr.appendChild(td);
        }
        return tr;
    }

    remove_tracking_num(id) {
        var trElement = this.trackingNum_htmlElements[id],
            parentElement = trElement.parentElement;

        parentElement.removeChild(trElement);
    }
}