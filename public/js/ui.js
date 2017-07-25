(function () {
    "use strict";

    EZSTOCKS.ui = {
        auth: null,
        defaultPage: 'login-page',

        navMenuConfig: {
            logged: ['dashboard', 'edit-account', 'logout'],
            anonymous: ['create-account', 'login']
        },

        init: function (firebaseAuth) {
            this.auth = firebaseAuth;

            this.updateNavMenuOnUserContext();

            //add event listener and stuff
            this.bindEvents();

            //default page
            this.navigateToPage(this.defaultPage);
        },

        bindEvents: function () {
            $('#create-account-form').on('submit', (e) => {
                e.preventDefault();
                this.createAccountFormSubmit();
            });

            $('body').on('click', '.js-nav-create-account-page', (e) => {
                e.preventDefault();
                this.navigateToPage('create-account-page');
            });

            $('body').on('click', '.js-nav-login-page', (e) => {
                e.preventDefault();
                this.navigateToPage('login-page');
            });
        },

        navigateToPage: function (pageId) {
            var $page = $('#' + pageId);

            if ($page.is(':visible')) return;

            this.updateNavMenu(pageId);

            $('.js-page').hide();
            $page.fadeIn();
        },

        updateNavMenuOnUserContext: function () {
            var item, navItems, i;
            
            navItems = this.auth.isLogged() ?
                this.navMenuConfig.logged
                : this.navMenuConfig.anonymous;

            $('nav li').hide();

            for (i = 0; i < navItems.length; i += 1) {
                item = navItems[i];

                $('nav').find('.js-' + item).show();
            }
        },

        updateNavMenu: function (pageId) {
            $('nav li').removeClass('active');
            $('nav .js-nav-' + pageId).addClass('active');
        },

        getNewAccontInformation: function () {
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

        createAccountFormSubmit: function () {
            var user = this.getNewAccontInformation();

            this.auth.createUser(user)
                .then(() => {
                    this.navigateToPage('dashboard-page');
                });
        }
    };
}());