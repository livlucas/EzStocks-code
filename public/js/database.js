(function () {
    "use strict";

    var collectionNames = {
        users: '/users',
        stocks: '/stocks',
        trending: '/trending',
    };


    EZSTOCKS.database = {
        fdb: null, 

        init: function (firebaseDb) {
            this.fdb = firebaseDb;

            //this.bindEvents();
        },

        readUserByUid: function (uid) {
            return this.fdb
                .ref(collectionNames.users + '/' + uid)
                .once('value')
                .then((dbs) => {
                    return dbs.val();
                });
        },

        saveUser: function (user, uid) {
            delete user.password;

            if (uid === undefined) throw new Error('Missing user UID');

            return this.fdb
                .ref(collectionNames.users + '/' + uid)
                .set(user);
        },

        //temporary function to save fake stocks to database
        addStockToDatabase: function () {
            this.fdb.ref(collectionNames.stocks).set(
            {
                Google: {
                    name: 'Google',
                    symbol: 'GOOG',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },

                Netflix: {
                    name: 'Netflix',
                    symbol: 'NFLX',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },

                 Amazon: {
                    name: 'Amazon',
                    symbol: 'AMZN',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },

                 Facebook: {
                    name: 'Facebook',
                    symbol: 'FB',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },

                 Apple: {
                    name: 'Apple',
                    symbol: 'AAPL',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },
            });
        },

        //temporary function to save fake trending stocks to database
        addTrendingToDatabase: function () {
           this.fdb.ref(collectionNames.trending).set(
            {
                Herbalife: {
                    name: 'Herbalife',
                    symbol: 'HLF',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },

                FireEye: {
                    name: 'FireEye',
                    symbol: 'FEYE',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },

                 Intel: {
                    name: 'Intel Corporation',
                    symbol: 'INTC',
                    lastPrice: 930.55,
                    change: 0.33,
                    closedPrice: 930.50,
                    daysHigh: 937.45,
                    daysLow: 929.26,
                },
            }); 
        },

        //TODO
        getStocks: function () {
            return this.fdb
                .ref(collectionNames.stocks)
                .once('value')
                .then((dbs) => {
                    var stocks = [];

                    dbs.forEach((child) => { 
                        stocks.push(child.val()); 
                    });

                    return stocks;
                });
        },

        getTrending: function () {
            return this.fdb
                .ref(collectionNames.trending)
                .once('value')
                .then((dbs) => {
                    var trendings = [];

                dbs.forEach((child) => {
                    trendings.push(child.val());
                });

                return trendings;
            });
        }
    };
}());