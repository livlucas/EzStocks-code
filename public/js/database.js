(function () {
    "use strict";

    var collectionNames = {
        users: '/users',
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
        }
    };
}());