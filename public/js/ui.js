(function () {
    "use strict";

    EZSTOCKS.ui = {
        auth: null,
        defaultPage: 'login-page',
        loggedPage: 'dashboard-page',

        navMenuConfig: {
            logged: ['dashboard', 'edit-account', 'user-name', 'logout'],
            anonymous: ['create-account', 'login']
        },

        init: function (auth) {
            this.auth = auth;

            //add event listener and stuff
            this.bindEvents();

            this.auth
            .getInitialUserState()
            .then((user) => {
                var pageToNav = this.defaultPage;

                console.log(user);

                this.updateNavMenuOnUserContext();

                if (user) {
                    pageToNav = this.loggedPage;
                }
                //default page
                this.navigateToPage(pageToNav);
            });
        },

        bindEvents: function () {
            //navigation
            $('body').on('click', '.js-nav-create-account-page', (e) => {
                e.preventDefault();
                this.navigateToPage('create-account-page');
            });

            $('body').on('click', '.js-nav-login-page', (e) => {
                e.preventDefault();
                this.navigateToPage('login-page');
            });

            $('body').on('click', '.js-logout', (e) => {
                e.preventDefault();
                this.logoutUser();
            });

            //forms
            $('#create-account-form').on('submit', (e) => {
                e.preventDefault();
                this.createAccountFormSubmit();
            });

            $('#login-form').on('submit', (e) => {
                e.preventDefault();
                this.loginFormSubmit();
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

            this.setNavUsername();
        },

        updateNavMenu: function (pageId) {
            $('nav li').removeClass('active');
            $('nav .js-nav-' + pageId).addClass('active');
        },

        getNewAccontInformation: function () {
            return {
                name: $('#first-name').val(),
                email: $('#email').val(),
                password: $('#password').val()
            };
        },

        getLoginInformation: function () {
            return {
                email: $('#login-email').val(),
                password: $('#login-password').val()
            };
        },

        loginFormSubmit: function () {
            var userData = this.getLoginInformation();

            this.auth
            .login(userData)
            .then((user) => {
                this.updateNavMenuOnUserContext();
                this.navigateToPage('dashboard-page');
            });
        },

        setNavUsername: function () {
            var user = this.auth.getLoggedUser();

            if (!user) return;

            $('#nav-display-username').text(user.name);
        },

        createAccountFormSubmit: function () {
            var user = this.getNewAccontInformation();

            this.auth
            .createUser(user)
            .then(() => {
                this.updateNavMenuOnUserContext();
                this.navigateToPage(this.loggedPage);
            });
        },

        logoutUser: function () {
            this.auth.logout()
            .then(() => {
                this.updateNavMenuOnUserContext();
            });
        }
    };
}());