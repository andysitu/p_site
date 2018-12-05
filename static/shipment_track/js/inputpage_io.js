var t;
class TrackingForm {
    constructor(form_id, tracking_submit_url, csrf_token, controller) {
        this.form = document.getElementById("tracking-form");
        this.id = form_id;
        this.submit_url = tracking_submit_url;
        this.csrf_token = csrf_token;

        this.controller_ref = controller;

        this.typeInput_obj = new TypeInput(this);

        this.load();
    }

    load() {
        /**
         * loads eventlistners, handlers
         */
        this.addSubmitHandler();
    }

    addSubmitHandler() {
        let that = this;
        this.form.addEventListener("submit", function(e) {
            e.preventDefault();
            that.submit(e);
        });
    }

    getData() {
        // Gets data from Form & returns it in obj.
        var form_data = new FormData(this.form);
        
        // var trackingType = form_data.get("trackingType"),
        //     tracking_number = form_data.get("trackingNumber");

        this.clear_form();
        
        return form_data;
    }
    checkFormData(form_data) {
        if (form_data.get("trackingNumber")=="" || form_data.get("trackingType")=="")
            return false;
        return true;
    }

    clear_form() {
        // Clear Tracking Number Input element.
        document.getElementById("trackingNumInput").value = "";
        // this.form.reset();
    }

    submit(e) {
        var tracking_form = document.getElementById("tracking-form");

        var form_data = this.getData();
        if (!this.checkFormData(form_data)) {
            console.log("EMPTY TRACKING INPUT");
        } else {
            this.controller_ref.submit_tracking_data(this.submit_url, this.csrf_token, form_data);
        }
    }
}

class TypeInput {
    // Class that handles that input for type.
    // JS changes when additional types need to be added.
    constructor(trackingForm) {
        this.id = "trackingNumInput";
        this.input_container_id = "type-input-div";
        this.addButton_container_id = "addTypeButton-span";
        this.addButton_img_url = addButton_img_url;
        this.xButton_img_url = xButton_img_url;
        // If addType_status is true, then add_type needs to be an
        // input ele rather than select to add the type in.
        this.addType_status = false;

        this.trackingForm = trackingForm;

        this.load();
    }

    load(){
        this.createInput();
        this.createAddButton();
    }

    get controller_ref() {
        return this.trackingForm.controller_ref;
    }

    switch_addType_status() {
        if (this.addType_status)
            this.addType_status = false;
        else
            this.addType_status = true; 
    }

    createInput() {
        if (this.addType_status) {
            this.createAddTypeInput();
        } else {
            this.createAddTypeSelect();
        }
    }
    
    createAddTypeInput() {
        /**
         * Creates an input / select element for add type depending 
         *  on addType_status. 
         *  input - > select, true - > input element
         */
        var input_container = this.get_input_container();
        
        var domstring = '<input class="form-control" name="trackingType" id="typeInput"></input>';
        input_container.innerHTML = domstring;
    }

    createAddTypeSelect() {
        var that = this;
        function create_select(types_dict) {
            var input_container = that.get_input_container();

            var domstring = '<select class="form-control" name="trackingType" id="typeSelect"></select>';
            input_container.innerHTML = domstring;

            var select_ele = input_container.firstChild

            var type_name, option_ele;

            for (type_name in types_dict) {
                option_ele = document.createElement("option");
                option_ele.appendChild(document.createTextNode(type_name));
                option_ele.setAttribute("value", types_dict[type_name])
                select_ele.appendChild(option_ele);
            }
        }

        this.get_tracking_types(create_select);
        
    }

    createAddButton() {
        /**
         * Creates the add button, depending on addType status.
         */
        var addButton_container = this.get_addButton_container();
        if (this.addType_status) {
            var domstring = '<img id="add-type-button" class="icon-button" src="' + this.xButton_img_url + '" alt="x">';
        } else {
            var domstring = '<img id="add-type-button" class="icon-button" src="' + this.addButton_img_url + '" alt="+">';
        }
        addButton_container.innerHTML = domstring;
        this.typeAddButtonHandler();
    }

    typeAddButtonHandler() {
        var add_button = document.getElementById("add-type-button");
        var that = this;
        add_button.addEventListener("click", function(e){
            that.switch_addType_status();
            that.createAddTypeInput();
            that.createAddButton();
        });
    }

    get_tracking_types(response_func) {
        this.controller_ref.get_tracking_types(io.types_url, response_func);
    }
    
    get_input_container() {
        return document.getElementById(this.input_container_id); }
    get_addButton_container() {
        return document.getElementById(this.addButton_container_id); }
}

class TrackingList {
    // Class to display tracking numbers inputted.
    constructor(container_id, get_data_url, csrf_token, controller) {
        this.container_id = container_id;
        this.div_id = "tracking-list-div";
        this.get_data_url = get_data_url;
        this.csrf_token = csrf_token;

        this.controller_ref = controller;
        this.JS2Django_heading_map = {
            "Tracking Number": "tracking_number",
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
        this.controller_ref.get_tracking_data(
            this.get_data_url,
            this.show_tracking_data.bind(this));
    }

    make_tracking_list(trackingInfo_dic) {
        var containerEle = this.container;

        var tableEle = document.createElement("table");
        tableEle.classList.add("table");

        var threadEle = document.createElement("thead"),
            tbodyEle = document.createElement("tbody"),
            tr,
            th, td;

        var JS2Django_heading_map = this.JS2Django_heading_map,
            th_list = Object.keys(JS2Django_heading_map);

        tr = document.createElement("tr");
        for (let i = 0; i < th_list.length; i++) {
            th = document.createElement("th");
            th.setAttribute("scope", "col");
            th.appendChild(document.createTextNode(th_list[i]));
            tr.appendChild(th);
        }
        threadEle.appendChild(tr);

        for (let track_num in trackingInfo_dic) {
            let tracking_dic = trackingInfo_dic[track_num];
            tr = document.createElement("tr");
            for (let i = 0; i < th_list.length; i++) {
                td = document.createElement("td");
                
                let heading_name = th_list[i];
                let py_heading_name = JS2Django_heading_map[heading_name];
                let value = tracking_dic[py_heading_name];
                td.appendChild(document.createTextNode(value));
                tr.appendChild(td);
            }
            tbodyEle.appendChild(tr);
        }

        tableEle.appendChild(threadEle);
        tableEle.appendChild(tbodyEle);

        containerEle.appendChild(tableEle);
    }
}


var io = {
    // Handles input and output of data & EventListeners
    load: function() {
        /**
         * Create & use TrackingForm to handle submit listeners 
         *  & interactions with form
        */
       var csrf = io.get_csrf();
       var tracking_form = new TrackingForm("tracking-form", submit_url, csrf, controller);
       t = tracking_form;
       var tracking_list = new TrackingList("tracking-list-container", get_data_url, csrf, controller);
    },
    delete: function() {
    },
    get_csrf: function() {
        var csrf_input = document.getElementsByName('csrfmiddlewaretoken')[0];
        return csrf_input.value;
    },
    get types_url() {
        return get_types_url;
    }
};

window.onload = io.load;