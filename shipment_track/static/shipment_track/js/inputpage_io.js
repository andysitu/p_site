var form_data

class TrackingForm {
    constructor(form_id) {
        this.form = document.getElementById("tracking-form");
        this.id = form_id;
        this.load();
        this.typeInput_obj = new TypeInput();
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
        
        var type = form_data.get("type"),
            tracking_number = form_data.get("trackingNumber");

        this.clear_form();
        return {
            "type": type,
            "tracking_number": tracking_number,
        };
    }

    clear_form() {
        this.form.reset();
    }

    submit(e) {
        var tracking_form = document.getElementById("tracking-form");

        var data = this.getData();
        console.log(data);
    }
}

class TypeInput {
    constructor() {
        this.id = "trackingNumInput";
        this.input_container_id = "type-input-div";
        // If addType_status is true, then add_type needs to be an
        // input ele rather than select to add the type in.
        this.addType_status = false;
        this.load();
        
    }

    load(){
        this.createAddTypeInput();
        this.typeAddButtonHandler()
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
        if (this.addType_status) {
            var input_container = this.get_input_container();
            var domstring = '<input class="form-control" name="type" id="typeInput"></input>';
            input_container.innerHTML = domstring;
        } else {
            var input_container = this.get_input_container();
            var domstring = '<select class="form-control" name="type" id="typeSelect"></select>';
            input_container.innerHTML = domstring;
        }
    }

    typeAddButtonHandler() {
        var add_button = document.getElementById("add-type-button");
        var that = this;
        add_button.addEventListener("click", function(e){
            console.log(that);
            that.switch_addType_status();
            that.createAddTypeInput();
        });
    }


    
    get_input_container() {
        return document.getElementById(this.input_container_id);
    }
}

var io = {
    // Handles input and output of data & EventListeners
    load: function() {
        /**
         * Create & use TrackingForm to handle submit listeners 
         *  & interactions with form
        */
        var tracking_form = new TrackingForm("tracking-form");
    },
    delete: function() {
    },
};

window.onload = io.load;