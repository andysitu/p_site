class TrackingForm {
    constructor(form_id, io_controller) {
        this.form = document.getElementById("tracking-form");
        this.id = form_id;
        
        this.tracking_input_id = "trackingNumInput";

        this.io_controller_ref = io_controller;

        this.typeInput_obj = new TypeInput(this);

        this.load();
    }

    // get io_controller_ref() {
    //     return this.io_controller_ref;
    // }

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
        var tracking_input_ele = document.getElementById(this.tracking_input_id)
        tracking_input_ele.value = "";
        tracking_input_ele.focus();
        // this.form.reset();
    }

    submit(e) {
        var tracking_form = document.getElementById("tracking-form");

        var form_data = this.getData();
        if (!this.checkFormData(form_data)) {
            console.log("EMPTY TRACKING INPUT");
        } else {
            this.io_controller_ref.submit_tracking_data(form_data);
        }
    }
}

class TypeInput {
    // Class that handles that input for type.
    // JS changes when additional types need to be added.
    constructor(trackingForm) {
        this.id = "typeInput";
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

    get io_controller_ref() {
        return this.trackingForm.io_controller_ref;
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
        
        var domstring = '<input class="form-control" name="trackingType" id="' + this.id +'"></input>';
        input_container.innerHTML = domstring;
    }

    createAddTypeSelect() {
        var that = this;
        function create_select(types_dict) {
            var input_container = that.get_input_container();

            var domstring = '<select class="form-control" name="trackingType" id="' + that.id +'"></select>';
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
        this.io_controller_ref.get_tracking_types(response_func);
    }
    
    get_input_container() {
        return document.getElementById(this.input_container_id); }
    get_addButton_container() {
        return document.getElementById(this.addButton_container_id); }
}

var io = {
    submit_url: submit_url,
    ajax_command_url: ajax_command_url,
    csrf_token: null,
    tracking_form: null,
    tracking_list: null,
    // Handles input and output of data & EventListeners
    load: function() {
        /**
         * Create & use TrackingForm to handle submit listeners 
         *  & interactions with form
        */
       var csrf = io.get_csrf();
       this.csrf_token = csrf;
       
       this.tracking_form = new TrackingForm("tracking-form", this);
       this.tracking_list = new TrackingList("tracking-list-container", get_data_url, this);
    },
    delete: function(id) {
        var that = this;
        var formData = new FormData();
        formData.append("id", id);
        formData.append("ajax_command", "delete_tracking_num");

        controller.postAjax(
            that.ajax_command_url, this.csrf_token, formData
        ).then(function(response) {
            that.tracking_list.remove_tracking_num(id);
        }), function(error) {
            console.log("Error with delete", error);
        };
    },
    get_csrf: function() {
        var csrf_input = document.getElementsByName('csrfmiddlewaretoken')[0];
        return csrf_input.value;
    },
    get types_url() {
        return get_types_url;
    },
    submit_tracking_data: function(form_data) {
        var that = this;
        function response_func(data) {
            that.tracking_list.add_tracking_num(data.id, data, true);
        }
        controller.submit_tracking_data(this.submit_url, this.csrf_token, form_data, response_func);
    },
    get_tracking_types: function(response_func) {
        controller.get_tracking_types(this.types_url, response_func);
    },
    get_tracking_data: function(get_data_url, response_func) {
        controller.get_tracking_data(get_data_url, response_func);
    },
};

window.onload = function() {
    io.load();
};