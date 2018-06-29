var eleName_dic = {

};

$( document).ready(function() {
    $( "#" + searcher.form_id ).on("submit", function(e) {
        e.preventDefault();
        searcher.search(searcher.display_search_results.bind(searcher));
        searcher.searching();
    });
});

var searcher = {
    display_containerID: "body-div",
    form_id: "search-form",
    rcv_container: "rcv_container",
    empty_page: function() {
        $("#" + this.display_containerID).empty();
    },
    submit_handler: function(e) {
        console.log("HI");
    },
    searching: function() {
        $("#search-input").val('');
        $("#" + searcher.rcv_container).empty()
    },
    search: function(callback_function){
        var $form = $("#" + this.form_id);

        var form_data = $form.serializeArray();
        console.log(form_data);
        $.ajax({
            url: rcv_search_ajax_url,
            data: form_data,
            success: function(response) {
                if (callback_function) {
                    callback_function(response);
                }
                else
                    console.log(response);
            },
        });
    },
    display_search_results: function(rcvs_obj) {
        /**
         * Display search results for rcv
         * Is a callback function for the ajax request.
         * Input: [ search_results{}... ]
         */
        var search_term,
            $table;

        this.empty_page();
        for (search_term in rcvs_obj) {
            $table = this.make_$table(search_term, rcvs_obj[search_term]);
            $("#" + this.display_containerID).append($table);
        }

    },
    make_$table: function(search_term, rcvs_arr) {
        /**
         * Creates $table.
         * rcvs_dic: Array containing rcv objects.
         * @type {*}
         */
        var $table = $("<table>", {
                "class": "table",
            }),
            $tr, $th, Q$td;

        var filename, correct_name,
            input_date, rcv_date, upload_date,
            rcv, original_filename;

        var $thead = $("<thead>");
        $tr = $("<tr>");

        $tr.append("<th>", {
            scope: "col",
            text: gettext("RCV"),
        });

        $tr.append(
            $("<th>", {
                scope: "col",
            }).append($("<i>", {
                "class": "fa fa-pencil",
            }))
        );

        $tr.append(
            $("<th>", {
                scope: "col",
            }).append($("<i>", {
                "class": "fa fa-download",
            }))
        );

        $tr.append($("<th></th>", {
            scope: "col",
            text: gettext("Upload Date"),
        }));

        $tr.append($("<th></th>", {
            scope: "col",
            text: gettext("RCV Date"),
        }));

        $tr.append($("<th></th>", {
            scope: "col",
            text: gettext("Input Date"),
        }));

        $tr.append($("<th></th>", {
            scope: "col",
            text: gettext("Filename"),
        }));

        $tr.append($("<th></th>", {
            scope: "col",
        }).append($("<i class='fa fa-check'></i>")));
        $thead.append($tr);
        
        $table.append($thead);

        var i,
            rcv_dic;
            rcvs_len = rcvs_arr.length;

        var $tbody = $("<tbody>"),
            $td;

        for (i = 0; i < rcvs_len; i++) {
            $tr = $("<tr class='search-tr'>");
            rcv_dic = rcvs_arr[i];

            $td = $("<td>").append(
                $("<a>", {
                    href: rcv_view_by_id_url + rcv_dic["id"],
                    text: rcv_dic["rcv"],
                    target: "_blank"
                })
            );
            $tr.append($td);

            $td = $("<td>");
            $td.append(
                $("<a>", {
                    href: edit_url + rcv_dic["filename"],
                    target: "_blank"
            }).append($("<i>", {
                "class": "fa fa-pencil",
                })));
            $tr.append($td);

            $td = $("<td>");
            $td.append(
                $("<a>", {
                    href: rcv_dl_by_id_url + rcv_dic["id"],
            }).append($("<i>", {
                "class": "fa fa-download",
                })));
            $tr.append($td);

            $td = this.make_$td(rcv_dic["upload_date"]);
            $tr.append($td);

            $td = this.make_$td(rcv_dic["rcv_date"]);
            $tr.append($td);

            $td = this.make_$td(rcv_dic["input_date"]);
            $tr.append($td);

            $td = this.make_$td(rcv_dic["filename"]);
            $tr.append($td);

            if (rcv_dic["correct_name"]) {
                $td = $("<td class='fa fa-check'></td>");
            } else {
                $td = $("<td>");
            }
            $tr.append($td);

            $tbody.append($tr);
        }

        $table.append($tbody);

        return $table;

    },
    make_$td: function(value) {
        return $("<td>", {
            text: value,
        });
    },
};