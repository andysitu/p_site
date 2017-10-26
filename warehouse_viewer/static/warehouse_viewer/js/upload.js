$( document ).ready(function() {

    // Event handler for submitting the upload of excel file.
    $("#upload-form").submit(function(e){
        var file = $("#fileupload")[0].files[0], result;

        result = check_file(file);

        if (result === true) {
            $( '#upload-button' ).hide();

            var loading_icon_html = "<i class='fa fa-refresh fa-spin' aria-hidden='true'></i>";

            write_msg( "<h4>" + gettext("Currently Uploading") + loading_icon_html) + "</h4>";
        } else {
            write_msg(result);
            e.preventDefault();
        }
    });
});

function check_file(file) {
    /**
     * Checks whether a file exists and whether it has the correct
     *  file format and file name.
     * File: file type (html)
     * Returns true if it's correct, otherwise the html message to be displayed.
     */
    var filename = file.name,
        filetype = file.type,
        file_re = /(\d{14}).xlsx/;

    re_result = file_re.exec(filename);

    if (file == undefined) {
        return gettext("No file was uploaded");
    } else if (filetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        return gettext("The file needs to be an excel file [.XLSX]");
    } else if (re_result == null || re_result[1].length != 14) {
        return gettext("Incorrect file name. It needs to have 14 numbers for yyyymmddhhmmss[year, month, day, hour, minute, second].")
    }
    return true;
}

function write_msg(msg) {
    $( '#upload-msg-div' ).html(msg);
}