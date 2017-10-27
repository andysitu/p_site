$( document ).ready(function(){
    set_settings_from_mode();
    $("#data-mode").change(set_settings_from_mode);
});