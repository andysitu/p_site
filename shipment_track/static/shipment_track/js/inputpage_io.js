var t;

class TrackingForm {
    constructor(form_id, io_controller) {
        this.form = document.getElementById("tracking-form");
        this.id = form_id;
        
        this.tracking_input_id = "trackingNumInput";

        this.io_controller_ref = io_controller;

        this.typeInput_obj = t = new TypeInput(this);

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
        console.log(this.form);
        console.log(form_data);
        console.log(this.typeInput_obj.get_type());

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
        this.selectId = "typeSelect";
        this.inputId = "typeInput";
        this.input_container_id = "type-input-div";
        this.addButton_container_id = "addTypeButton-span";
        this.addButton_img_url = addButton_img_url;
        this.xButton_img_url = xButton_img_url;

        this._typesDict = {
        };

        this.trackingForm = trackingForm;

        this.load();
    }

    load(){
        this.createAddTypeSelect();
        this.createAddButton();
    }   

    get io_controller_ref() {
        return this.trackingForm.io_controller_ref;
    }

    addTypeWindow() {
        var typeName = window.prompt(gettext("What type name would you like?"));
        return typeName;
    }

    createAddTypeSelect() {
        var that = this;
        function create_select(types_dict) {
            var input_container = that.get_input_container();

            var domstring = '<select class="form-control" name="trackingType" id="' + that.selectId +'"></select>';
            input_container.innerHTML = domstring;

            var select_ele = input_container.firstChild

            var type_name, option_ele, typeId;

            for (type_name in types_dict) {
                typeId = types_dict[type_name];
                that.addTypeElement(typeId, type_name);
            }
        }

        // get_tracking_types uses create_select for a response function in ajax.
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
            that.makeType();
        });
    }

    get_tracking_types(response_func) {
        this.io_controller_ref.get_tracking_types(response_func);
    }
    
    get_input_container() {
        return document.getElementById(this.input_container_id); }
    get_addButton_container() {
        return document.getElementById(this.addButton_container_id); }

    get_type() {
        var input_container = this.input_container_id,  
            input = input_container.firstChild;
        console.log(input);
    }

    makeType() {
        var typeName = this.addTypeWindow(),
            that = this;
        if (this.checkTypeName(typeName)) {
            io.createType(typeName, function(responseDict) {
                var infoDict = JSON.parse(responseDict);
                var typeName = infoDict["typeName"],
                    typeId = infoDict["typeId"];

                that.addTypeElement(typeId, typeName);
            });
            
        }
    }   
    checkTypeName(typeName) {
    // Check if Tracking Type exists and if the name is valid.
        // Check if  type name exists; if so, select it.
        if (typeName in this._typesDict) {
            this.selectType(this._typesDict[typeName], typeName);
            return false;
        }   

        // Check if typeName is valid
        if (typeName != null && typeName != "")
            return true;
    }

    selectType(typeId, typeName) {
        var selectElement = document.getElementById(this.selectId),
            option, value;
        
        for (var i=0; i < selectElement.length; i++) {
            option = selectElement[i];
            value = option.value;
            if (value == typeId) {
                selectElement.selectedIndex = i;
                return true;
            }
        }
    }

    addTypeElement(typeId, typeName, selectedStatus = true) {
        // Add type to the html select. Also adds selected attribute
        //  unless noted otherwise. Also, adds type to typesDict
        var selectElement = document.getElementById(this.selectId);

        this._typesDict[typeName] = typeId;

        var optionElement = document.createElement("option");
        optionElement.appendChild(document.createTextNode(typeName));
        optionElement.setAttribute("value", typeId);
        optionElement.setAttribute("selected", true);

        selectElement.appendChild(optionElement);

        selectElement.focus(optionElement);
    }
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
    createType: function(typeName, responseFunction) {
        var that = this;

        var formData = new FormData();
        formData.append("typeName", typeName);
        formData.append("ajax_command", "createTrackingType");

        controller.postAjax(
            that.ajax_command_url, this.csrf_token, formData
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
    get types_url() {
        return get_types_url;
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
        controller.get_tracking_types(this.types_url, response_func);
    },
    get_tracking_data: function(get_data_url, response_func) {
        controller.get_tracking_data(get_data_url, response_func);
    },
};

window.onload = function() {
    io.load();
};