$( document ).ready(function(){
    console.log("Ready");

    formObj.add_filter_div();
    formObj.add_date_input();
});

var formObj = {
    get_$disp_container: function() {
        return $("#display-container");
    },
    add_date_input: function() {
        var $disp_container = this.get_$disp_container();

        $disp_container.append( settings_maker.date_input_1() );
    },
    add_filter_div: function() {
        var $disp_container = this.get_$disp_container();

        $disp_container.append( settings_maker.filter_div() );
    },
};