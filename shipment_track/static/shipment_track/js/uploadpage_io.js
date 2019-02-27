var io = {
    postAjax_url: null,
    csrf_token: null,
    get_types_url: get_types_url,
    load: function() {
        this.postAjax_url = postAjax_url;
        this.csrf_token = io.get_csrf();
        this.addFormHandler()
        this.uploadForm = new UploadForm(this);
    },
    get_csrf: function() {
        var csrf_input = document.getElementsByName('csrfmiddlewaretoken')[0];
        return csrf_input.value;
    },
    get_tracking_types: function(response_func) {
        controller.get_tracking_types(this.get_types_url, response_func);
    },
    addFormHandler() {
        var formEle = document.getElementById("uploadForm"),
            that = this;
        formEle.addEventListener("submit", function(e) {
            e.preventDefault();
            var fileInput = document.getElementById("fileInput");
            var files = fileInput.files;

            var trackingTypeID = document.getElementById("typeSelect").value;

            
            that.uploadFiles(files, trackingTypeID);
            e.target.reset();
        });
    },
    uploadFiles(filesObj, trackingTypeID){
        console.log(filesObj);
        var filesLength = filesObj.length,
            csvFile, fileName;
        
        for (let i = 0; i < filesLength; i++) {
            csvFile = filesObj[i];
            this.uploadCSVFile(csvFile, trackingTypeID);
        }
    },
    uploadCSVFile(csvFile, trackingTypeID) {
        //Read entire CSV file at once
        var fileReader = new FileReader(),
            result;
        fileReader.onload = function(event) {
            result = fileReader.result;
            processData(result);
        }
        function processData(allText) {
            var allTextLines = allText.split(/\r\n|\n/);
            var entries = allTextLines.map(textArr => textArr.split(",")),
                entryArr, entry, dateObj;

            var currentDateObj, inputArr = [],
                result;

            var headerStatus = checkHeadings(entries[0]);
            if (headerStatus) {
                var i = 1;
            } else
                var i = 0;

            var todayDate = new Date();

            for ( ; i < entries.length; i++) {
                entryArr = entries[i];
                for (var j = 0; j < entryArr.length; j++) {
                    entry = entryArr[j];
                    if (entry == "")
                        continue;

                    checkEntryResult = checkEntry(entry);
                    if (typeof(checkEntryResult) == "object") {
                        // Date object
                        //  Change currentDateObj
                        result = checkDateObj(checkEntryResult, todayDate);
                        if (result)
                            currentDateObj = checkEntryResult;
                    } else if (checkEntryResult) {
                        inputArr.push({
                            "trackingNum": entry,
                            "receiveDateObj": currentDateObj,
                            "trackingTypeID": trackingTypeID
                        });
                    }
                }
            }
            io.uploadEntriesAjax(inputArr);
        }
        
        function checkDateObj(dateObj, currentDate) {
            var year = parseInt(dateObj["year"]),
                month = parseInt(dateObj["month"]),
                day = parseInt(dateObj["day"]);
            var presentYear = currentDate.getFullYear

            var errorDate = month + "/" + day + "/" + year;

                if (month > 12 || month < 0)
                    throw "Month exceeded parameters: " + errorDate;
                else if (day > 31 || day <= 0)
                    throw "Day exceeded parameters: " + errorDate;
                else if (year > presentYear || year < 2015)
                    throw "Year exceeded parameters: " + errorDate;

                return true;
        }

        function getDate(dateStr) {
            /* 
            *   Reads string & sees if it's mm/dd/yyyy format.
            *   If so, returns {"month", "day", "month"}
            *   If not, returns false
            */ 
            var dateRe1 = /(\d+)[\/\-](\d+)[\/\-](\d+)/;
            var result = (dateRe1.exec(dateStr));
            if (result) {
                var dateObj = {};

                var month, day, year;
                month = result[1];
                
                dateObj["month"] = month;

                day = result[2];
                
                dateObj["day"] = day;
                
                year = result[3];
                dateObj["year"] = year;

                return dateObj;
            } else
                return false;
        }

        function checkEntry(entry) {
            /* Check if the string is a tracking number
                Does so by checking if length of string > 5
                and if it's a date. Returns date obj if it is.
            */
            var dateObj = getDate(entry);
            if (dateObj) {
                return dateObj;
            }
                
            else if (entry.length > 5)
                return true;
            else
                return false;
        }


        function checkHeadings(entryArr) {
            // Check if the CSV row contains a heading
            // Does so by looking for any dates exists in cell
            for (var i = 0; i < entryArr.length; i++) {
                if (getDate(entryArr[i]))
                    return false;
            }
            return true;

        }
        fileReader.readAsText(csvFile);
    },
    uploadCVSFile1(csvFile) {
        // Read CSV as array buffer in chunks.
        const CHUNK_SIZE = 1024;
        var offset = 0;
        var fileName = csvFile.name;
        
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
            // console.log(fileReader.result);
            // console.log(event.target.result);
            var view = new Uint8Array(fileReader.result);

            for (var i = 0; i < view.length; ++i) {
                if (view[i] === 10 || view[i] === 13) {
                    console.log(offset+i);
                    return;
                }
            }
            offset += CHUNK_SIZE;
            seek();
        };
        fileReader.onerror = function(){
            console.log("error reading file");
        }

        function seek() {
            if (offset >= csvFile.size) {
                console.log(csvFile.size);
                return;
            }
            var slice = csvFile.slice(offset, offset+CHUNK_SIZE);
            fileReader.readAsArrayBuffer(slice);
        }

        fileReader.readAsBinaryString(csvFile);
    },
    uploadEntriesAjax(entriesArr) {
        console.log(entriesArr.length);
        var entriesJsonArr = JSON.stringify(entriesArr);
        var formData = new FormData();
        formData.append("ajax_command", "uploadEntries");
        formData.append("entriesJsonArr", entriesJsonArr);
        controller.postAjax(
            this.postAjax_url, this.csrf_token, formData,
        )
    },
}

class UploadForm {
    constructor(ioController) {
        this.io = ioController;
        this.typeInputObj = new TypeInput(this, false, false);
        this.form = document.getElementById("uploadForm");
    }
}

window.onload = function() {
    io.load();
};