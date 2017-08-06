(function () {
    "use strict";

    var collectionNames = {
        users: '/users',
        stocks: '/stocks',
        trending: '/trendings',
    };


    EZSTOCKS.database = {
        fdb: null,

        trendingSize: 10,

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

        increaseTrendingScore: function (stock) {
            var id = stock.Symbol,
                ref = this.fdb.ref(collectionNames.stocks + '/' + id);

            return ref
            .once('value')
            .then((dbs) => {
                var result = dbs.val();

                if (result === null) {
                    result = stock;
                }

                if (!result.hasOwnProperty('trendingScore')) {
                    result.trendingScore = 0;
                }

                result.trendingScore += 1;
                stock.trendingScore = result.trendingScore;

                return ref.set(result);
            });
        },

        getTrending: function () {
            return this.fdb
                .ref(collectionNames.stocks)
                .orderByChild('trendingScore')
                .limitToLast(this.trendingSize)
                .once('value')
                .then((dbs) => {
                    var trendings = [];

                    dbs.forEach((d) => {
                        trendings.push(d.val());
                    });

                    return trendings.reverse();
                });
        }
    };
}());