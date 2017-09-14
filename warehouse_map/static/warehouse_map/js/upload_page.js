$( document ).ready(function() {
    $( '#upload-button' ).click(function(e) {
        var result = false;
        e.preventDefault();

        var loading_icon_html = "<i class='fa fa-refresh fa-spin fa-3x fa-fw' aria-hidden='true'></i>";

        result = check_excel_file(e);

        if (result) {
            e.click();
            $( '#upload-button' ).attr('disabled', true);
            $( '#id_excel_data_file' ).attr('disabled', true);

            write_upload_msg( gettext("Currently Uploading.") + loading_icon_html);
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
    } else if (re_result[2] != 'xlsx') {
        write_upload_msg("The file should be an excel file, ending in XLSX.");
        return false;
    }
    return true;
}

function write_upload_msg(msg) {
    $( '#upload-msg-div' ).html(msg);
}