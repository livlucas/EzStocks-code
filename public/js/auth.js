(function () {
    "use strict";

    EZSTOCKS.auth = {
        fauth: null, 
        db: null, 

        _isUserLogged: false,
        _loggedUser: null,

        init: function (firebaseAuth, appDb) {
            this.fauth = firebaseAuth;

            this.db = appDb;

            //this.bindEvents();
        },

        isLogged: function () {
            //change this based on the fauth event
            return this._isUserLogged;
        },

        getLoggedUser: function (cb) {
            var authUser,
                userData;

            if (this._loggedUser) {
                cb(this._loggedUser);
                return;
            }

            //TODO: check if the user is logged in
            authUser = this.fauth.currentUser;

            //read user data from db using UID
            //.then(() => {
            //     this._loggedUser = {
            //         authUser: authUser,
            //         data: userData
            //     };

            //     cb(this._loggedUser);
            // });
        },

        login: function() {
            //same as firebase-login-test
        },

        logout: function () {
            //set _loggedUser null
        },

        register: function (user) {
            this.createUser();
            //2 steps process:
            //1st: create user with email and password
            //2nd: use the user id to create secutiry 
            //questions in the user databse under collection users
        },

        createUser: function (user) {
            return this.fauth
                .createUserWithEmailAndPassword(
                    user.email, 
                    user.password
                )
                .then((createdUser) => {
                    return this.db.saveUser(user, createdUser.uid);
            });
        },
    };
}());