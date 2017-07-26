(function () {
    "use strict";

    EZSTOCKS.auth = {
        fauth: null, 
        db: null, 

        _loggedUser: null,
        _initAuthPromise: null,

        init: function (firebaseAuth, appDb) {
            this.fauth = firebaseAuth;

            this.db = appDb;

            this.bindEvents();
        },

        bindEvents: function () {
            this._initAuthPromise = new Promise((resolve) => {
                this.fauth.onAuthStateChanged(firebaseUser => {
                    if (this._initAuthPromise.done) return;

                    if (!firebaseUser) {
                        this._setUser(null);
                        resolve(false);
                        return;
                    }

                    this.db
                    .readUserByUid(firebaseUser.uid)
                    .then((user) => {
                        this._setUser(user);
                        resolve(user)
                    });
                })
            })
            .then(data => {
                this._initAuthPromise.done = true;
                return data;
            });
        },

        _setUser: function (user) {
            this._loggedUser = user;

            return user;
        },

        getInitialUserState: function () {
            return this._initAuthPromise;
        },

        isLogged: function () {
            return !!this._loggedUser;
        },

        getLoggedUser: function () {
            return this._loggedUser;
        },

        login: function(user) {
            return this.fauth
            .signInWithEmailAndPassword(
                user.email, 
                user.password
            )
            .then(firebaseUser => 
                this.db
                .readUserByUid(firebaseUser.uid)
                .then((user) =>
                    this._setUser(user)
                )
            )
            .catch(() => this._setUser(null));
        },

        logout: function () {
            this._setUser(null);
            return this.fauth.signOut();
        },

        createUser: function (user) {
            return this
            .fauth
            .createUserWithEmailAndPassword(
                user.email, 
                user.password
            )
            .then((createdUser) =>
                this.db
                .saveUser(user, createdUser.uid)
                .then(() => this._setUser(user))
            );
        },
    };
}());