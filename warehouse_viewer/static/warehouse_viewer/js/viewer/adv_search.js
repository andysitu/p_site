$( document ).ready(function(){
    $("#search-form").submit(function(e){
        e.preventDefault();
        formObj.submit();
    })
    formObj.create_form()
});

var formObj = {
    submit: function() {
        // Submit function for the search form.
    },
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

        var $form_group = settings_maker.date_input_1();
        $form_group.addClass("col-md-2");
        $form_container.append( $form_group );
    },
    add_filter_div: function() {
        var $form_container = this.get_$form_container();
        var $form_group = settings_maker.filter_div();
        $form_group.addClass("col-md-3");

        $form_container.append($form_group);
    },
    add_loc_level_select: function() {
        var $loc_and_level_dic = settings_maker.loc_and_level_container(),
            $form_container = this.get_$form_container();

        var $loc_div = $loc_and_level_dic["$loc_div"],
            $level_container = $loc_and_level_dic["$level_container"];
        $loc_div.addClass("col-md-2");
        $level_container.addClass("col-md-3");

        var $div = $("<div></div>", {
            "class": "form-group",
        });
        $div.append($loc_div);
        $div.append($level_container);

        $form_container.append($div);
    },
};