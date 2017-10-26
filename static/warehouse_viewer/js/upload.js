$( document ).ready(function() {
    $("#upload-form").submit(function(e){

        var values = {};
        $.each($("#upload-form").serializeArray(), function(i, field) {
            console.log(i, field);
            values[field.name] = field.value;
        });

        console.log(values);
    });
});