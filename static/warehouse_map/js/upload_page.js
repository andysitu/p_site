$( document ).ready(function() {
    if (upload_response != 0) {
        write_upload_msg(upload_response);
    }

    $( '#upload-button' ).click(function(e) {

        var result = false;

        var loading_icon_html = "<i class='fa fa-refresh fa-spin fa-fw' aria-hidden='true'></i>";

        result = check_excel_file(e);

        if (result) {
            $( '#upload-button' ).hide();

            write_upload_msg( "<h1>" + gettext("Currently Uploading") + loading_icon_html) + "</h1>";
        } else{
            e.preventDefault();
        }
    });
});

function check_excel_file() {
    var files = $( '#id_excel_data_file' )[0].files,
        files_length = files.length,
        re = /(\d+).(\w+)/,
        file, i, name,
        re_result;

    if (files_length == 0) {
        write_upload_msg(gettext("No file was uploaded."));
        return false;
    }

    file = files[0];
    filename = file.name;
    re_result = re.exec(filename);
    if (re_result == null || re_result[1].length != 14) {
        write_upload_msg(gettext("The file is named incorrectly. It should contain 14 numbers for year, month, day, hour, minute, and second."));
        return false;
    } else if (re_result[2] != 'xlsx' && re_results[2] == 'xls') {
        write_upload_msg("The file should be an excel file, ending in XLSX.");
        return false;
    }
    return true;
}

function write_upload_msg(msg) {
    $( '#upload-msg-div' ).html(msg);
}