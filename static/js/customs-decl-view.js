function run_on_load() {
    var elements = document.getElementsByClassName('customs-li')
    var ele_length = elements.length

    var i = 0

    for (i=0 ; i < ele_length; i++) {
        elements[i].addEventListener("mouseenter", hoovering_customs_link)
    }
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';'),
            i;
        for (i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
    }

    return cookieValue
}


document.addEventListener("DOMContentLoaded", run_on_load);

function delete_customs_link(filename) {
    customs_element = document.getElementById(filename + '-li');
    customs_element.parentNode.removeChild(customs_element)
}

function click_add_link_response(e) {
    if (e.target.classList.contains('cust-add-link-delete')) {
        xmlhttpRequest = new XMLHttpRequest();
        xmlhttpRequest.onreadystatechange = function(event) {
            if (xmlhttpRequest.readyState == XMLHttpRequest.DONE) {
                if (xmlhttpRequest.status == 200) {
                    var responseText = xmlhttpRequest.responseText;
                    if (responseText == "0") {
                        console.log("LOGIN REQUIRED");
                    } else {
                        // responseText is filename
                        delete_customs_link(responseText)
                    }

                }
            }
        };

        var cust_regex = /(.+)-delete-link/;
        cust_ele_id = e.target.id;
        regex_result = cust_regex.exec(cust_ele_id);
        filename = regex_result[1]

        var command = "delete";

        var formData = new FormData();
        formData.append('command', 'delete');
        formData.append('filename', filename);

        xmlhttpRequest.open('POST', './delete/', true);
        xmlhttpRequest.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        xmlhttpRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xmlhttpRequest.send(formData);
    } else {
    }
}

function hoovering_customs_link(e) {
    var li_element = e.target,
        li_element_id = e.target.id,
        i = 0;

    var customs_regex = /(.+)-.+/;
    results = customs_regex.exec(li_element_id);
    customs_filename = results[1];

    var add_link_div = document.getElementById(customs_filename + '-cust-add-link-div');
    add_link_div.classList.remove('customs-add-link-hide');
    add_link_div.classList.add('customs-add-link-unhide');

    var child_link_length = add_link_div.children.length
    for (i=0; i < child_link_length; i++) {
        add_link_div.children[i].addEventListener("click", click_add_link_response, false);
    }

    li_element.addEventListener("mouseleave", function(e) {
        add_link_div.classList.remove('customs-add-link-unhide');
        add_link_div.classList.add('customs-add-link-hide');
    })
}