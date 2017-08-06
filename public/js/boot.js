(function ($) {
    var ns = EZSTOCKS,

        config = {
            api: {
                endpoint: 'https://query.yahooapis.com/v1/public/yql',
                stockReference: 'yahoo.finance.quote',
                searchReference: 'pm.finance.autocomplete',

                data: {
                    format: 'json',
                    env: 'store://datatables.org/alltableswithkeys'
                }
            },

            auth: {
                functionsEndpoint: 'https://us-central1-testproject-hk.cloudfunctions.net/app'
            }
        },
        db, auth;

    db = firebase.database();
    auth = firebase.auth();

    //initialization
    ns.database.init(db);
    ns.auth.init(config.auth, auth, ns.database, $);
    ns.api.init(config.api, $);

    //dom loaded
    $(function () {
        ns.ui.init(ns.auth, ns.database, ns.api);
    });

    //DEBUG ONLY
    window.E = EZSTOCKS;
}(jQuery));