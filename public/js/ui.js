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

            this.initMaterialize();

            //initing user state
            this.auth
            .getInitialUserState()
            .then((user) => {
                var pageToNav = this.defaultPage;

                this.updateNavMenuOnUserContext();
                this.updateForms();

                if (user) {
                    pageToNav = this.loggedPage;
                }
                //default page
                this.navigateToPage(pageToNav);
            });
        },

        initMaterialize: function () {
            //materialize side nav
            $('.button-collapse').sideNav({
                closeOnClick: true
            });

            //select forms
            $('select').material_select();
        },

        bindEvents: function () {
            //navigation
            $('body').on('click', '.js-nav-create-account-page', (e) => {
                e.preventDefault();

                $('#first-name').val('');
                //focus not working. check this!
                $('#first-name').focus();
                $('#email').val('');
                $('#password').val('');

                $('select').material_select();
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

            $('body').on('click', '.js-nav-edit-account-page', (e) => {
                e.preventDefault();
                 
                this.navigateToPage('edit-account-page');
            });

            $('body').on('click', '.js-nav-dashboard-page', (e) =>{
                e.preventDefault();
                 
                this.navigateToPage('dashboard-page');
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
            this.updateForms();

            $('.js-page').hide();
            $page.fadeIn();

            $('body').scrollTop(0);

            $('form:visible input:first').focus();
        },

        updateNavMenuOnUserContext: function () {
            var item, navItems, i;

            navItems = this.auth.isLogged() ?
                this.navMenuConfig.logged
                : this.navMenuConfig.anonymous;

            $('nav li').hide();
            $('#mobile-demo li').hide();


            for (i = 0; i < navItems.length; i += 1) {
                item = navItems[i];

                $('nav').find('.js-' + item).show();
                $('#mobile-demo').find('.js-' + item).show();
            }

            this.setNavUsername();
        },

        updateNavMenu: function (pageId) {
            $('.js-nav-menu li').removeClass('active');
            $('.js-nav-menu .js-nav-' + pageId).addClass('active');
        },

        setNavUsername: function () {
            var user = this.auth.getLoggedUser();

            if (!user) return;

            $('#nav-display-username').text(user.name);
        },

        updateForms: function () {
            var user = this.auth.getLoggedUser();

            if (!user) return;

            this.clearLoginForm();
            this.clearSignUpForm();
            this.fillEditForm();
        },

        getNewAccontInformation: function () {
            return {
                name: $('#first-name').val(),
                email: $('#email').val(),
                password: $('#password').val(),
                question1: $('#select-first-question').val(),
                answer1: $('#first-answer').val(),
                question2: $('#select-second-question').val(),
                answer2: $('#second-answer').val(),
                question3: $('#select-third-question').val(),
                answer3: $('#third-answer').val(),
            };
        },

        getLoginInformation: function () {
            return {
                email: $('#login-email').val().trim(),
                password: $('#login-password').val().trim()
            };
        },

        loginFormSubmit: function () {
            var userData = this.getLoginInformation();

            this.auth
            .login(userData)
            .then((user) => {
                if (!user) {
                    $('#login-form input[text]:first').focus();
                    return;
                }
                this.updateNavMenuOnUserContext();
                this.navigateToPage('dashboard-page');
            });
        },

        //form updates
        clearLoginForm: function () {
            $('#login-form')[0].reset();
        },

        clearSignUpForm: function () {
            $('#create-account-form')[0].reset();
        },

        fillEditForm: function () {
            var $form = $('#edit-account-form');

            var user = this.auth.getLoggedUser();

            user.password = '';

            $form.inputValues(user);

            //materialize updates required
            Materialize.updateTextFields();
            $form.find('select').material_select('update');
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

$( document ).ready(function() {
    $(".dropdown-button").dropdown({
            hover: false
        });
});