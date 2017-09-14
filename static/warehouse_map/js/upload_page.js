$( document ).ready(function() {
    $( '#upload-button' ).click(function(e) {
        e.preventDefault();

        check_excel_file();
        
        $( '#upload-button' ).attr('disabled', true);
        $( '#id_excel_data_file' ).attr('disabled', true);
    });
});

function check_excel_file() {
    var files = $( '#id_excel_data_file' )[0].files,
        files_length = files.length,
        file, i;

    for (i = 0; i < files_length; i++) {
        file = files[i];
    }
}