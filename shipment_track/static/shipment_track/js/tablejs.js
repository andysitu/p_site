class TrackingList {
    // Class to display tracking numbers inputted.
    constructor(container_id, get_data_url, io_controller) {
        this.trackingNum_htmlElements = {}

        this.container_id = container_id;
        this.div_id = "tracking-list-div";
        this.get_data_url = get_data_url;
        this.tbody_id = "tracking-tbody";

        this.io_controller_ref = io_controller;

        this.trackingNumArr = [];
        this.JS2Django_heading_map = {
            "Tracking Number": "tracking_number",
            "Options": "",
            "Input Date": "input_date",
            "Type": "typeName",
            "Receive Date": "receive_date",  
        };

        this.load();
    }

    getHeaderMap(includeOptions=true) {
        var o = {}
        Object.assign(o, this.JS2Django_heading_map);
        if (!includeOptions)
            delete o["Options"];
        return o;
    }

    load() {
        this.make_tracking_list();
    }

    make_tracking_list(trackingInfoDic) {
        var containerEle = this.container;

        var tableEle = document.createElement("table");
        
        tableEle.classList.add("table");
        tableEle.classList.add("table-hover");

        var threadEle = document.createElement("thead"),
            tbodyEle = document.createElement("tbody"),
            heading_tr,
            th, td;

        tbodyEle.setAttribute("id", this.tbody_id);

        var headerMap = this.getHeaderMap(),
            th_list = Object.keys(headerMap);

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
        
        this.trackingNumArr.push(tracking_dic);

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

        var headerMap = this.getHeaderMap(),
            th_list = Object.keys(headerMap),
            tr, th,
            headerName;

        tr = document.createElement("tr");
        for (let i = 0; i < th_list.length; i++) {
            headerName = th_list[i];
            th = create_th(th_list[i]);
            tr.appendChild(th);

        }
        return tr;
    }
    create_tracking_tr(tracking_num_id, tracking_dic) {
        var headerMap = this.getHeaderMap(),
            th_list = Object.keys(headerMap);
            
        var tr = document.createElement("tr"),
            td;
            
        for (let i = 0; i < th_list.length; i++) {
            var value;
            td = document.createElement("td");
            
            let heading_name = th_list[i];
            let py_heading_name = headerMap[heading_name];
            if (heading_name != "Options") {
                value = tracking_dic[py_heading_name];
                td.appendChild(document.createTextNode(value));
            } else { // Add delete button
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
        this.trackingNumArr = [];
        var tbodyNode = document.getElementById(this.tbody_id);
        while (tbodyNode.firstChild)
            tbodyNode.removeChild(tbodyNode.firstChild);
    }

    createCSV(trackingInfoDic) {
        var fileName = window.prompt(gettext("What should the name of the CSV file be?"));
        var headerMap = this.getHeaderMap(false),
            headerMapValues = Object.values(headerMap),
            headerArr = Object.keys(headerMap);
        
        var dataArr =[],
            rowArr,
            dataDict, headerKey;

        // Convert tracking into array
        for(var i=0; i<this.trackingNumArr.length; i++) {
            rowArr = [];
            dataDict = this.trackingNumArr[i];
            for (var j =0; j < headerMapValues.length; j++) {
                headerKey= headerMapValues[j];
                rowArr.push(dataDict[headerKey]);
            }
            dataArr.push(rowArr);
        }

        function processRow(dataRow) {
            var finalValue = '';
            for (var i=0; i < dataRow.length; i++) {
                var innerValue = dataRow[i]===null ? '' : dataRow[i].toString();
                if (dataRow[i] instanceof Date) {
                    innerValue = dataRow[i].toString();
                }
                var result = innerValue.replace(/"/g, '""'); // /g replaces entire string, not just first
                if (result.search(/("|,|\n)/g) >=0)
                    result = '"' + result + '"';
                // finalValue += String.fromCharCode(9);
                if (i > 0)
                    finalValue += ",";
                finalValue += result;
            }
            return finalValue + '\n';
        }
        

        var csvContent = '';
        csvContent += processRow(headerArr);
        for (var i = 0; i < dataArr.length; i++) {
            csvContent += processRow(dataArr[i]);
        }
        var BOM = "\uFEFF";
        csvContent += BOM;

        var blob = new Blob([csvContent], { type:"text/csv;charset=utf-8" });
        if (navigator.msSaveBlob) { // IO 10+
            navigator.msSaveBlob(blob, fileName);
        } else {
            var link = document.createElement("a");
            if (link.download != undefined) {
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", fileName + ".csv");
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
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