$( document ).ready(function(){
    $display_container = $("#display-container");

    side_menu.load_side_menu();
    side_menu.set_settings_from_mode();

    $("#data-mode").change(function() {
        side_menu.set_settings_from_mode();
    });

    $("#side-menu-form").submit(function(e) {
        e.preventDefault();
        side_menu.submit(e)
    });

    $("#print-button").click(function(e) {
        var disp_content = viewer.get_display_content();
        viewer.open_new_page(disp_content);
    });

    // Menu Buttons
    $('#menu-settingButton').on('click', function() {
        $('#menu-setting').addClass('reveal');
        $('.overlay').show();
    });

    $('.overlay').on('click', function() {
        $('#menu-setting').removeClass('reveal');
        $('#menu-screen-container').removeClass('reveal');
        $('.overlay').hide();
    });

    // Click on Delete items by date link
    $( '#date-del-link' ).click(function(e){
        e.preventDefault();
        page_functions.make_menuScreen("delete_date");
        map_ajax.fill_delMenu_date();
        $('#menu-setting').removeClass('reveal');
        $('#menu-screen-container').addClass('reveal');
    });
});

// Jquery to account for nav bar & HTML anchoring
(function set_anchor(document, history, location) {
    var HISTORY_SUPPORT = !!(history && history.pushState);

    var anchorScrolls = {
        ANCHOR_REGEX: /^#[^ ]+$/,
        OFFSET_HEIGHT_PX: 30,

        /**
         * Establish events & fix scroll position if a hash is provided.
         */
        init: function() {
          this.scrollToCurrent();
          $(window).on('hashchange', $.proxy(this, 'scrollToCurrent'));
          $("body").on('click', 'a', $.proxy(this, 'delegateAnchors'));
        },

        /**
         * Return the offset amount to deduct from the normal scroll position.
         */
        getFixedOffset: function() {
          return this.OFFSET_HEIGHT_PX;
        },

        /**
         * Scroll to the href if it is an anchor to an element on the page.
         * @param href (String)
         * @returns {boolean} - If href is an anchor
         */
        scrollIfAnchor: function(href, pushToHistory) {
            var match, anchorOffset;

            if(!this.ANCHOR_REGEX.test(href)) {
                return false;
            }

            match = document.getElementById(href.slice(1));

            if(match) {
                anchorOffset = $(match).offset().top - this.getFixedOffset();
                window.scrollTo(window.pageXOffset, anchorOffset);
                // $('html, body').animate({ scrollTop: anchorOffset});

                // Add the state to history as-per normal anchor links
                if(HISTORY_SUPPORT && pushToHistory) {
                    history.pushState({}, document.title, location.pathname + href);
                }
            }

            return !!match;
        },

        /**
         * Attempt to scroll to the current location's hash.
         */
        scrollToCurrent: function(e) {
            if(this.scrollIfAnchor(window.location.hash) && e) {
                e.preventDefault();
            }
        },

        /**
         * if the click event's target was an anchor, fix the scroll position.
         */
        delegateAnchors: function(e) {
            var ele = e.target;

            if(this.scrollIfAnchor(ele.getAttribute('href'), true)) {
                e.preventDefault();
            }
        }
    };

    $(document).ready($.proxy(anchorScrolls, 'init'));
})(window.document, window.history, window.location);