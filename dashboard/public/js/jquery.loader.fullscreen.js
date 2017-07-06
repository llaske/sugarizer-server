var loader = {};

$(document).ready(function () {

    loader = {

        begin: function () {
            $("body").addClass("loading");
        },
        stop: function () {
            $("body").removeClass("loading");
        }
    };
});