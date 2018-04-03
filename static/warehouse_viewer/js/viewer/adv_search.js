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
        var $form_container = this.get_$form_container();

        $form_container.append( settings_maker.date_input_1() );
    },
    add_filter_div: function() {
        var $form_container = this.get_$form_container();

        $form_container.append( settings_maker.filter_div() );
    },
    add_loc_level_select: function() {
        var $loc_and_level_dic = settings_maker.loc_and_level_container(),
            $form_container = this.get_$form_container();

        var $loc_div = $loc_and_level_dic["$loc_div"],
            $level_container = $loc_and_level_dic["$level_container"];

        $form_container.append($loc_div);
        $form_container.append($level_container);
    },
};