var controller = {
    // Handles Processing of data
    // Isolated from HTML Details & Elements, which io JS files handle.
    ajax_command: function(url, csrf_token, data_obj) {
        if (command=="del_tracking_num") {
            data_obj["command"] = "delete";
            this.postAjax(url, csrf_token, data_obj);
        }
    },

    submit_tracking_data: function(tracking_submit_url, csrf_token, data, response_func) {
        this.postAjax(tracking_submit_url, csrf_token, data).then(function(response) {
            console.log("submit", data);
            if (typeof response_func == "function") {
                let data = JSON.parse(response);
                response_func(data);
            } else
                console.log(response);  
        }, function(error) {
            console.log("Error");
            console.log(error);
        });
    },
    get_tracking_types: function(get_types_url, response_func, error_func) {
        this.get(get_types_url).then(
            function(response) {
                let data = JSON.parse(response);
                if (response_func == undefined) {
                    console.log(data);
                } else {
                    response_func(data);
                }
            },
            function(error) {
                if (error_func==undefined) {
                    console.log("ERROR");
                    console.log(error);
                } else {
                    error_func(error);
                }
            }
        );
    },
    get_tracking_data: function(get_tracking_url, response_func, error_func) {
        // Gets Tracking Data thru get Ajax, and then runs response function
        //  given in parameter and passes parsed JSON data to it.
        this.get(get_tracking_url).then(
            function(response) {
                let data = JSON.parse(response);
                if (response_func == undefined) {
                    console.log(data);
                } else {
                    response_func(data);
                }
            },
            function(error) {
                if (error_func==undefined) {
                    console.log("ERROR");
                    console.log(error);
                } else {
                    error_func(error);
                }
            }
        );
    },
    get: function(url) {
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
    
            req.onload = function() {
                if (req.status == 200) {
                    resolve(req.response);
                } else {
                    reject(Error(req.statusText));
                }
            }
            req.onerror = function() {
                reject(Error("Network Error"));
            }
            req.send();
        });
    },
    postAjax: function(url, csrf, data){  
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest(); 
            req.open('POST', url, true);
            req.setRequestHeader('X-CSRFToken', csrf);
    
            req.onload = function() {
                if (req.status == 200) {
                    resolve(req.response);
                } else {
                    reject(Error(req.statusText));
                }
            };
    
            req.onerror = function() {
                reject(Error("Network Error"));
            };
    
            req.send(data);
        });
    },
};