class TrackingForm {
    constructor(form_id, io_controller) {
        this.form = document.getElementById("tracking-form");
        this.id = form_id;
        
        this.tracking_input_id = "trackingNumInput";

        this.io_controller_ref = io_controller;

        this.typeInput_obj = new TypeInput(this);

        this.load();
    }

    get io() {
        return this.io_controller_ref;
    }

    load() {
        /**
         * loads eventlistners, handlers
         */
        this.addButtonHandlers();
    }

    addButtonHandlers() {
        let that = this;
        this.form.addEventListener("submit", function(e) {
            e.preventDefault();
            that.submit(e);
        });
    }
    
    getData() {
        // Gets data from Form & returns it in obj.
        var form_data = new FormData(this.form);

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
        var form_data = this.getData();
        if (!this.checkFormData(form_data)) {
            console.log("EMPTY TRACKING INPUT");
        } else {
            this.io.submit_tracking_data(form_data);
        }
    }
}



var io = {
    get_types_url: get_types_url,
    submit_url: submit_url,
    postAjax_url: postAjax_url,
    csrf_token: null,
    tracking_form: null,
    tracking_list: null,
    // Handles input and output of data & EventListeners
    load: function() {
        /**
         * Create & use TrackingForm to handle submit listeners 
         *  & interactions with form    
        */
       this.csrf_token = io.get_csrf();
       
       this.tracking_form = new TrackingForm("tracking-form", this);
       this.tracking_list = new TrackingList("tracking-list-container", get_data_url, this);

       this.showTodayData();

       var csvButton = document.getElementById("exportCSVButton");
       csvButton.addEventListener("click", function(e) {
           e.preventDefault();
           that.tracking_list.createCSV();
       });
    },
    delete: function(id) {
        var that = this;
        var formData = new FormData();
        formData.append("id", id);
        formData.append("ajax_command", "delete_tracking_num");

        controller.postAjax(
            that.postAjax_url, this.csrf_token, formData
        ).then(function(response) {
            that.tracking_list.remove_tracking_num(id);
        }), function(error) {
            console.log("Error with delete", error);
        };
    },
    createType: function(typeName, responseFunction) {
        var that = this;

        var formData = new FormData();
        formData.append("typeName", typeName);
        formData.append("ajax_command", "createTrackingType");

        controller.postAjax(
            that.postAjax_url, this.csrf_token, formData
        ).then(function(response){
            responseFunction(response);
        }, function(error) {
            console.log("error with createType", error);
        });
    },
    get_csrf: function() {
        var csrf_input = document.getElementsByName('csrfmiddlewaretoken')[0];
        return csrf_input.value;
    },
    submit_tracking_data: function(form_data) {
        var that = this;
        function response_func(data) {
            console.log(data);
            that.tracking_list.add_tracking_num(data.id, data, true);
        }
        controller.submit_tracking_data(this.submit_url, this.csrf_token, form_data, response_func);
    },
    get_tracking_types: function(response_func) {
        controller.get_tracking_types(this.get_types_url, response_func);
    },
    get_tracking_data: function(get_data_url, response_func) {
        controller.get_tracking_data(get_data_url, response_func);
    },
    showTodayData: function() {
        formData = new FormData();
        formData.append("ajax_command", "getTodaysTrackingData");
        var that = this;

        controller.postAjax(
            this.postAjax_url, this.csrf_token, formData
        ).then(function(trackingNum_json) {
            var trackingNumId,
                dataObj,
                trackingNum_obj = JSON.parse(trackingNum_json);
            

            that.tracking_list.clearList();
            for (trackingNumId in trackingNum_obj) {
                dataObj = trackingNum_obj[trackingNumId]
                that.tracking_list.add_tracking_num(trackingNumId, dataObj, true);
            }
            
        }, function(error) {
            console.log("error with submitting search form");
        });
    },
};

window.onload = function() {
    io.load();
};