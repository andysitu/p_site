var elements = document.getElementsByClassName("rcv");
var elements_length = elements.length;

function ready_func() {
    console.log("READY");
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function click_add_link_response(e) {
    var rcv_regex = /(.+)-.+/;
    ele_id = e.target.id
    result = rcv_regex.exec(ele_id)
    rcv_filename = result[1]

    xmlhttpRequest = new XMLHttpRequest();
    xmlhttpRequest.onreadystatechange = function(event) {
        if (xmlhttpRequest.readyState == XMLHttpRequest.DONE) {
            if (xmlhttpRequest.status == 200) {
                if (xmlhttpRequest.responseText == "0") {
                    write_message("You need to login");
                } else {
                    console.log(xmlhttpRequest.responseText);
                }
            }
        }
    };
    if (e.target.classList.contains("add-link-delete")) {
        xmlhttpRequest.open('POST', './delete/', true);
        xmlhttpRequest.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        xmlhttpRequest.setRequestHeader('X-Requested-With', 'xmlhttpRequestRequest');
        xmlhttpRequest.setRequestHeader('POST', 'test');
        xmlhttpRequest.send();
    } else {

    }
    
}

function delete_rcv_link(rcv) {
    li_element = document.getElementById(rcv + '-li');
    li_element.parentNode.removeChild(li_element);
}


function hoovering_rcv(e) {
    var link_ele = e.target;
    var rcv = link_ele.text;

    var add_link_div = document.getElementById(rcv + '-add-links-div');
    add_link_div.classList.remove('add-link-hide');
    add_link_div.classList.add('add-link-unhide');

    for (var i = 0; i < add_link_div.children.length; i++) {
        add_link_div.children[i].addEventListener('click', click_add_link_response);
    }

    var li_parent_ele = link_ele.parentElement;
    li_parent_ele.addEventListener('mouseleave', function(f) {
        add_link_div.classList.remove('add-link-unhide');
        add_link_div.classList.add('add-link-hide');
    });
};

for (var i = 0; i < elements_length; i++) {
    elements[i].addEventListener('mouseenter', hoovering_rcv);
};

function write_message(msg) {
    msg_box = document.getElementById("message-box");
    msg_box.textContent = msg;
}
