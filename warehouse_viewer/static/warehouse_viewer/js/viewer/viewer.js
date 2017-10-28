$( document ).ready(function(){
    side_menu.set_settings_from_mode();
    $("#data-mode").change(function() {
        side_menu.set_settings_from_mode();
    });
});