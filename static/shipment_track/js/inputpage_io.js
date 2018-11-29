class TrackingForm {
    constructor(form_id, tracking_submit_url, csrf_token, controller) {
        this.form = document.getElementById("tracking-form");
        this.id = form_id;
        this.load();
        this.typeInput_obj = new TypeInput();
        this.submit_url = tracking_submit_url;
        this.csrf_token = csrf_token;

        this.controller_ref = controller;
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
    constructor() {
        this.id = "trackingNumInput";
        this.input_container_id = "type-input-div";
        this.addButton_container_id = "addTypeButton-span";
        this.addButton_img_url = addButton_img_url;
        this.xButton_img_url = xButton_img_url;
        // If addType_status is true, then add_type needs to be an
        // input ele rather than select to add the type in.
        this.addType_status = false;
        this.load();
        
    }

    load(){
        this.createAddTypeInput();
        this.createAddButton();
    }

    switch_addType_status() {
        if (this.addType_status)
            this.addType_status = false;
        else
            this.addType_status = true; 
    }
    createAddTypeInput() {
        /**
         * Creates an input / select element for add type depending 
         *  on addType_status. 
         *  input - > select, true - > input element
         */
        var input_container = this.get_input_container();
        if (this.addType_status) {
            var domstring = '<input class="form-control" name="trackingType" id="typeInput"></input>';
            input_container.innerHTML = domstring;
        } else {
            var domstring = '<select class="form-control" name="trackingType" id="typeSelect"></select>';
            input_container.innerHTML = domstring;
        }
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
    
    get_input_container() {
        return document.getElementById(this.input_container_id); }
    get_addButton_container() {
        return document.getElementById(this.addButton_container_id); }
}

class TrackingList {
    constructor(container_id, get_data_url, csrf_token, controller) {
        this.container_id = container_id;
        this.div_id = "tracking-list-div";
        this.get_data_url = get_data_url;
        this.csrf_token = csrf_token;

        this.controller_ref = controller;

        this.load();
    }

    load() {
        this.get_tracking_data();
    }

    get_tracking_data() {
        this.controller_ref.get_tracking_data(this.get_data_url);
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
       var tracking_list = new TrackingList("tracking-list-container", get_data_url, csrf, controller);
    },
    delete: function() {
    },
    get_csrf: function() {
        var csrf_input = document.getElementsByName('csrfmiddlewaretoken')[0];
        return csrf_input.value;
    },
};

window.onload = io.load;