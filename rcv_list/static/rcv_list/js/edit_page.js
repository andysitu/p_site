$( document ).ready(function() {
    $( "#edit-form" ).submit(submit_edit);
    $("#rcv-name-input").focus()
});

function submit_edit(e) {
    e.preventDefault();

    var frm = $(this);

    var rcv_name = $( "#rcv-name-input" ).val(),
        pages_selected = [],
        checked = $("input:checked");

    checked.each(function(index, ele) {
        pages_selected.push($( this ).val());
    });

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !self.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    rcv_name = rcv_name.toUpperCase();
    var rcv_re = /^(RCV|RECV)\d{6}-\d{4}$/;

    //Check if rcv name is in correct format
    if (rcv_name + ".pdf" == rcv_filename) {
        alert(gettext("RCV name is the same as the original."))
    } else {
        var msg_1 = gettext("Are you sure "),
            msg_2 = gettext(" is the correct rcv number?");
        var confirm_status = window.confirm(msg_1 + rcv_name + msg_2);
        if (confirm_status) {
            $.ajax({
                type: frm.attr('method'),
                url: frm.attr('action'),
                data: {
                    "rcv_name": rcv_name,
                    "pages[]": pages_selected,
                    "filename": rcv_filename,
                },
                dataType: "json",
                success: function (data) {
                    console.log(data);
                    window.history.back();
                },
            });
        } else {
            $("#rcv-name-input").val("RCV").focus();
        }
    }
    return false;
}