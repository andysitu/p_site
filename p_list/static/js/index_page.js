var elements = document.getElementsByClassName("rcv")
var elements_length = elements.length

function ready_func() {
    console.log("READY")
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

function testy() {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == XMLHttpRequest.DONE) {
            if (httpRequest.status == 200) {
                console.log(httpRequest.responseText);
            }
        }
    };
    httpRequest.open('POST', './delete/', true);
    httpRequest.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    httpRequest.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    httpRequest.send()
}


function clicky(e) {
    var link_ele = e.target;
    var rcv = link_ele.text;
    var test_element = document.getElementById(rcv + '-test');
    test_element.classList.remove('add-link-hide');
    test_element.classList.add('add-link-unhide');
    test_element.addEventListener('click', testy);

    var li_parent_ele = link_ele.parentElement;
    li_parent_ele.addEventListener('mouseleave', function(f) {
        test_element.classList.remove('add-link-unhide');
        test_element.classList.add('add-link-hide');
    });
};

for (var i = 0; i < elements_length; i++) {
    elements[i].addEventListener('mouseenter', clicky);
};
function write_message(msg) {
    msg_box = document.getElementById("message-box")
    msg_box.textContent = msg
}
