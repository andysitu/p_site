/*
For functions that edit everything except canvas, ie the map
 */

function fill_sidemenu(max_level) {
    $('#data-type-select').empty();
    $('#level-select').empty();
    $('#date-select').empty();
    $('#date-select-2').empty();

    set_level_input(max_level);
    set_data_type();
    set_date_input()
    change_data_type_select()
}