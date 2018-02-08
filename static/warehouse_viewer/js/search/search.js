var search_menu = {
    elements: {
        search_container: "search-container",
    },
    create: function() {
        console.log(this.elements.search_container)
        var container = $("#" + this.elements.search_container);

        console.log(container);
    },
};

$( document).ready(function() {
    search_menu.create();
});