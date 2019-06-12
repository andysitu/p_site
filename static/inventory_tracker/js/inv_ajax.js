var inv_ajax = {
    getAjax: function(url) {
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
    postAjax: function(url, csrf, data, set_arraybuffer=false){
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest(); 
            req.open('POST', url, true);
            req.setRequestHeader('X-CSRFToken', csrf);

            if (set_arraybuffer)
                req.responseType = 'arraybuffer';
    
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
    get_csrf: function() {
        var csrf_input = document.getElementsByName('csrfmiddlewaretoken')[0];
        return csrf_input.value;
    },
}