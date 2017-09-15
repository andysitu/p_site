$( document). ready(function() {
    $.ajax({
        url: date_ajax_url,
        data: {

        },
        dateType: "json",
        success: function(date_dic) {
            var date_list = date_dic["date_list"],
                date_id_list = date_dic["date_id_list"],
                date_select_jobj = $( 'date-del-select' );

            var i,
                date_list_len = date_id_list.length;

            for (i = 0; i < date_list_len; i++) {
                date_select_jobj.append($("<option>", {
                    text: date_list[i],
                    value: date_id_list[i],
                }));
            }
        }
    });
});