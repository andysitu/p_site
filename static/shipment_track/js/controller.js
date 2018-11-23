var controller = {
    // Handles Processing of data
    // Isolated from HTML Details & Elements. Uses io JS files for this.
    submit_tracking_data: function(tracking_submit_url, csrf_token, data) {
        console.log(JSON.stringify(data));
        
        this.postAjax(tracking_submit_url, csrf_token, data).then(function(response) {
            console.log(response);
        }, function(error) {
            console.log("Error");
            console.log(error);
        });
    },
    get: function(url) {
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open('GET', url);
    
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
            // req.setRequestHeader("Content-Type", 'x-www-form-urlencoded');
    
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