class TrackingForm {
    constructor(form_id, tracking_submit_url, csrf_token) {
        this.form = document.getElementById("tracking-form");
        this.id = form_id;
        this.load();
        this.typeInput_obj = new TypeInput();
        this.submit_url = tracking_submit_url;
        this.csrf_token = csrf_token;
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

        // this.clear_form();
        
        return form_data;
    }

    clear_form() {
        this.form.reset();
    }

    submit(e) {
        var tracking_form = document.getElementById("tracking-form");

        var data = this.getData();

        controller.submit_tracking_data(this.submit_url, this.csrf_token, data);
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

var io = {
    // Handles input and output of data & EventListeners
    load: function() {
        /**
         * Create & use TrackingForm to handle submit listeners 
         *  & interactions with form
        */
       var csrf = io.get_csrf();
       var tracking_form = new TrackingForm("tracking-form", submit_url, csrf);
    },
    delete: function() {
    },
    get_csrf: function() {
        var csrf_input = document.getElementsByName('csrfmiddlewaretoken')[0];
        return csrf_input.value;
    },
};

window.onload = io.load;