function run_on_load() {
    click_add_link_response()
}


document.addEventListener("DOMContentLoaded", run_on_load);

function click_add_link_response() {
    var elements = document.getElementsByClassName('customs-li');
    var ele_len = elements.length;

    var i = 0;
    for (i=0; i< ele_len; i++) {
        elements[i].addEventListener("mouseenter", hoovering_customs_link);
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
        add_link_div.children[i].addEventListener("click", click_add_link_response);
    }

    li_element.addEventListener("mouseleave", function(e) {
        add_link_div.classList.remove('customs-add-link-unhide');
        add_link_div.classList.add('customs-add-link-hide');
    })
}