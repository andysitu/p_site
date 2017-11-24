var viewer_processor = {
    submit_search: function(form_element, callback_function) {
        var $form = $( form_element.target ),
            data_array = $form.serializeArray(),
            form_url = $form.attr("action"),
            form_method = $form.attr("method");

        var form_data = {},
            i,
            data_arr_len = data_array.length;

        for (i = 0; i < data_arr_len; i++) {
             var data_dic = data_array[i];
             if (data_dic["name"] != "csrfmiddlewaretoken") {
                 form_data[data_dic["name"]] = data_dic["value"];
             }
        }

        var data_mode = form_data["mode"],
            data_type = form_data['data-type'];

        $.ajax({
            // warehouse_viewer.search_ajax
            url: form_url,
            data: form_data,
            method: form_method,
            success: function(data) {
                viewer.display(data_mode, data_type, data);
                callback_function();
            },
        });
    },
};

var viewer_storage = {
    retrieve: function() {

    },
    save: function() {

    },

    store: function() {

    },
    get: function() {

    }
};