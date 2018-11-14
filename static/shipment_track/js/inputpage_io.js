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
        this.create_select();
        this.load();
    }

    load(){
        this.typeAddButtonHandler()
    }

    typeAddButtonHandler() {
        var add_button = document.getElementById("add-type-button");
        var that = this;
        add_button.addEventListener("click", function(e){
            that.create_input();
        });
    }
    
    get_input_container() {
        return document.getElementById(this.input_container_id);
    }

    create_select() {
        var input_container = this.get_input_container();
        var domstring = '<select class="form-control" name="type" id="typeSelect"></select>';
        input_container.innerHTML = domstring;

    }
    create_input() {
        var input_container = this.get_input_container();
        var domstring = '<input class="form-control" name="type" id="typeInput"></input>';
        input_container.innerHTML = domstring;
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