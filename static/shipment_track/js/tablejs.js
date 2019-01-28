class TrackingList {
    // Class to display tracking numbers inputted.
    constructor(container_id, get_data_url, io_controller) {
        this.trackingNum_htmlElements = {}

        this.container_id = container_id;
        this.div_id = "tracking-list-div";
        this.get_data_url = get_data_url;
        this.tbody_id = "tracking-tbody";

        this.io_controller_ref = io_controller;

        this.data = {};
        this.JS2Django_heading_map = {
            "Tracking Number": "tracking_number",
            "Options": "",
            "Input Date": "input_date",
            "Type": "typeName",
            "Receive Date": "receive_date",  
        };

        this.load();
    }

    load() {
        this.make_tracking_list();
    }

    make_tracking_list(trackingInfoDic) {
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

        if (trackingInfoDic) {
            for (let id in trackingInfoDic) {
                let tracking_dic = trackingInfoDic[id];
                this.add_tracking_num(id, tracking_dic, true);
            }
        }
    }

    get_tracking_data() {
        this.io_controller_ref.get_tracking_data(
            this.get_data_url,
            this.show_tracking_data.bind(this));
    }

    show_tracking_data(trackingInfoDic) {
        var that = this;

        var container_element = that.container;
        for (let id in trackingInfoDic) {
            let tracking_dic = trackingInfoDic[id];
            that.add_tracking_num(id, tracking_dic, true);
        }
    }

    get container() {
        return document.getElementById(this.container_id); }

    add_tracking_num(id, tracking_dic, addToTop = true) {
        var tbody = document.getElementById(this.tbody_id),
            tracking_tr = this.create_tracking_tr(id,tracking_dic);
        
        this.data[id] = tracking_dic

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

    clearList() {
        this.data = {};
        var tbodyNode = document.getElementById(this.tbody_id);
        while (tbodyNode.firstChild)
            tbodyNode.removeChild(tbodyNode.firstChild);
    }

    createCSV(trackingInfoDic) {
        var headerArr = Object.keys(this.JS2Django_heading_map);
        console.log(headerArr);
    }
}

class TypeInput {
    // Class that handles that input for type.
    // JS changes when additional types need to be added.
    constructor(form, createAddButton = true, allStatus=false) {
        this.selectId = "typeSelect";
        this.input_container_id = "type-input-div";
        this.addButton_container_id = "addTypeButton-span";

        if (createAddButton)
            this.addButton_img_url = addButton_img_url;

        this._typesDict = {};
        this.form = form;
        this.allStatus = allStatus;

        this.load(createAddButton);
    }

    load(createAddButton){
        this.createAddTypeSelect();
        
        if (createAddButton) 
            this.createAddButton();
    }   

    get io() {
        return this.form.io;
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

            if (that.allStatus) {
                that.addTypeElement("all", "All");
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
        this.io.get_tracking_types(response_func);
    }
    
    get_input_container() {
        return document.getElementById(this.input_container_id); }
    get_addButton_container() {
        return document.getElementById(this.addButton_container_id); }

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