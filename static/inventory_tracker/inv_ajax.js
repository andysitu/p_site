var inv_ajax = {
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
}