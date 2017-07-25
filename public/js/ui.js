(function () {
    "use strict";

    EZSTOCKS.ui = {
        auth: null,

        init: function (firebaseAuth) {
            this.auth = firebaseAuth;
            //add event listener and stuff
            this.bindEvents();
        },

        bindEvents: function () {
            $('#account-form').on('submit', (e) => {
                e.preventDefault();
                this.registerFormSubmit();
            });
        },

        hideLoginSection: function () {
            $('#account').hide();
            $('#login-header').hide();
        },

        hideCreateAccountSection: function() {
            //code here
        },

        getRegisterInformation: function() {
            var name,
                email,
                password;

            name = $('#first-name').val();
            email = $('#email').val();
            password = $('#password').val();

            return {
                name: name,
                email: email,
                password: password
            }
        },

        registerFormSubmit: function () {
            var user = this.getRegisterInformation();

            this.auth.createUser(user)
                .then(() => {
                    //user (what i need to do after I register the user)
                });
        }
    };
}());