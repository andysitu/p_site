var io = {
    tracking_list: null,
    load: function() {
        this.tracking_list = new TrackingList("tracking-list-container", get_data_url, this);
    }
};

window.onload = function() {
    io.load();
};