(function ($) {
    var ns = EZSTOCKS,

        config = {
            api: {

            }
        },
        db, auth;

    db = firebase.database();
    auth = firebase.auth();

    //initialization
    ns.database.init(db);
    ns.auth.init(auth, ns.database);
    ns.api.init(config.api);

    //dom loaded
    $(function () {
        ns.ui.init(ns.auth);
    });

    //DEBUG ONLY
    window.E = EZSTOCKS;
}(jQuery));