$( document ).ready(function(){
    formObj.create_form()
});

var formObj = {
    create_form: function() {
        this.add_filter_div();
        this.add_date_input();
        this.add_loc_level_select();
    },
    get_$form_container: function() {
        return $("#form-container");
    },
    add_date_input: function() {
        var $disp_container = this.get_$form_container();

        $disp_container.append( settings_maker.date_input_1() );
    },
    add_filter_div: function() {
        var $disp_container = this.get_$form_container();

        $disp_container.append( settings_maker.filter_div() );
    },
    add_loc_level_select: function() {
        var $loc_and_level = settings_maker.loc_and_level_container(),
            $disp_container = this.get_$form_container();

        $disp_container.append( $loc_and_level );
    },
    add_submit: function() {

    },
};