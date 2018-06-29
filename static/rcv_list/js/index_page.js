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
    var rcv_regex = /^(.+)-\w+$/;
    ele_id = e.target.id;
    result = rcv_regex.exec(ele_id);
    rcv_number = result[1];

    e.preventDefault();

    var command = '';

    xmlhttpRequest = new XMLHttpRequest();
    xmlhttpRequest.onreadystatechange = function(event) {
        if (xmlhttpRequest.readyState == XMLHttpRequest.DONE) {
            if (xmlhttpRequest.status == 200) {
                var responseText = xmlhttpRequest.responseText;
                if (responseText == "0") {
                    write_message("You need to login");
                } else {
                    switch(command) {
                        case "delete":
                            delete_rcv_link(responseText);
                            break;
                    }
                }
            }
        }
    };

    if (e.target.classList.contains("add-link-delete")) {
        command = "delete";

        var formData = new FormData();
        formData.append('command', "delete");
        formData.append('rcv_number', rcv_number);

        xmlhttpRequest.open('POST', './delete/', true);
        xmlhttpRequest.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        xmlhttpRequest.setRequestHeader('X-Requested-With', 'xmlhttpRequestRequest');

        xmlhttpRequest.send(formData);
    } else {

    }
}

function delete_rcv_link(rcv_number) {
    li_element = $("#" + rcv_number + "-li");
    li_element.remove();
}

function hoovering_rcv(e) {
    var li_ele = e.target,
        ele_id = e.target.id;
    var rcv_regex = /(.+)-.+/;
    result = rcv_regex.exec(ele_id);
    rcv_filename = result[1];

    var add_link_div = document.getElementById(rcv_filename + '-add-links-div');
    add_link_div.classList.remove('add-link-hide');
    add_link_div.classList.add('add-link-unhide');

    for (var i = 0; i < add_link_div.children.length; i++) {
        add_link_div.children[i].addEventListener('click', click_add_link_response);
    }

    li_ele.addEventListener('mouseleave', function(e) {
        add_link_div.classList.remove('add-link-unhide');
        add_link_div.classList.add('add-link-hide');
    });
};

function write_message(msg) {
    msg_box = document.getElementById("message-box");
    msg_box.textContent = msg;
}


function run_on_load() {
    var elements = document.getElementsByClassName("rcv-li");
    var elements_length = elements.length;

    for (var i = 0; i < elements_length; i++) {
        elements[i].addEventListener('mouseenter', hoovering_rcv);
    }
}

document.addEventListener("DOMContentLoaded", run_on_load);