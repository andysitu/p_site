var elements = document.getElementsByClassName("rcv")
var elements_length = elements.length

function clicky(e) {
    var link_ele = e.target
    var rcv = link_ele.text
    var test_element = document.getElementById(rcv + '-test')
    test_element.classList.remove('add-link-hide')
    test_element.classList.add('add-link-unhide')

    var li_parent_ele = link_ele.parentElement
    li_parent_ele.addEventListener('mouseleave', function(f) {
        test_element.classList.remove('add-link-unhide')
        test_element.classList.add('add-link-hide')
    })
}

for (var i = 0; i < elements_length; i++) {
    elements[i].addEventListener('mouseenter', clicky)
}