(function () {
    "use strict";

    EZSTOCKS.ui = {
        auth: null,
        db: null,
        defaultPage: 'login-page',
        loggedPage: 'dashboard-page',

        navMenuConfig: {
            logged: ['dashboard', 'edit-account', 'user-name', 'logout'],
            anonymous: ['create-account', 'login']
        },

        templates:{},

        data: {
            favorites: null,
            trending: null
        },

        //==========[ initializations ]===========
        init: function (auth, db) {
            this.auth = auth;
            this.db = db;

            //template engine
            this.initHandlebars();

            //ui framework
            this.initMaterialize();

            this.compileTemplates();
            this.bindEvents();

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

        initHandlebars: function () {
            HandlebarsIntl.registerWith(Handlebars);
        },

        initMaterialize: function () {
            //materialize side nav
            $('.button-collapse').sideNav({
                closeOnClick: true
            });

            //select forms
            $('select').material_select();

            //dropdown forms
            $(".dropdown-button").dropdown({
                hover: false
            });

            //TODO: need refactoring later
            $('#stock-search').autocomplete({
                data: {
                  "Apple": null,
                  'Adobe': null,
                  'Application': null,
                  "Microsoft": null,
                  "Google": 'https://placehold.it/250x250',
                  'Russel': null,
                  'Dow Jones': null,
                },
                onAutocomplete: (value) => {}, // on select value
                limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
                minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
            });
        },

        compileTemplates: function () {
            var html;

            html = $('#stock-item-template').html();
            this.templates.stockItem = Handlebars.compile(html);

            //add more here
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

            $('#edit-account-form').on('submit', (e) => {
                e.preventDefault();
                this.editFormSubmit();
            });

            $('#favorites-panel').on('click', '.delete', (e) => {
                var target = $(e.target);

                e.preventDefault();
                console.log(this.data.favorites);
                //inserir atributo pra facilitar a minha vida
                //manipular a lista de favorites e renderiza-la aqui.a lista tá em data.
                // target.parent().remove();
                console.log(target);
            });

            $('#trending-panel').on('click', '.add-stock', (e) => {
                var target = $(e.target);

                e.preventDefault();
                //after saving on database update updateStockList
                this.updateStockList();
            });
        },


        //==========[ app functions ]===========
        navigateToPage: function (pageId) {
            var $page = $('#' + pageId);

            if ($page.is(':visible')) return;

            this.updateNavMenu(pageId);
            this.updateForms();
            this.updateStockList(pageId);
            this.updateTrendingList(pageId);

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

        updateStockList: function (pageId) {
            if (pageId !== 'dashboard-page') return;

            this.db.getStocks()
            .then((stocks) => {
                this.data.favorites = stocks;

                this.renderFavorites(stocks);
            });
        },

        updateTrendingList: function (pageId) {
            if (pageId !== 'dashboard-page') return;

            this.db.getTrending()
            .then((trendings) => {
                this.data.trending = trendings;

                this.renderTrending(trendings);
            });
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

        logoutUser: function () {
            this.auth.logout()
            .then(() => {
                this.updateNavMenuOnUserContext();
            });
        },


        //==========[ page specific functions ]===========
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

        editFormSubmit: function () {
            var $form,
                user, uid;

            $form = $('#edit-account-form');
            user = $form.inputValues();

            delete user.email;

            user = this.auth.updateLoggedUserData(user);
            uid = this.auth.getLoggedUserUid();

            this.db.saveUser(user, uid)
            .then(() => {
                //updating app state
                this.updateNavMenuOnUserContext();
                this.updateForms();

                //navigating to dashboard
                this.navigateToPage('dashboard-page');
                Materialize.toast('Updated succesfully', 4000);
            });
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


        //==========[ render functions ]===========
        renderFavorites: function (stocks) {
            var $panel = $('#favorites-panel'),
                $collection = $panel.find('.collection'),
                $noStock = $panel.find('.no-stock');

            $collection.empty();

            if (!stocks || stocks.length === 0) {
                $collection.hide();
                $noStock.show();
                return;
            }

            $collection.hide();
            $noStock.hide();

            stocks.forEach((stock) => {
                var $stocksListItem;

                $stocksListItem = this.templates.stockItem({
                    isFavorite: true,
                    isNegative: (stock.change < 0),
                    displayName: stock.name + ' ' + stock.symbol,
                    stock: stock 
                });

                $collection.append($stocksListItem);
            });

            $collection.show();
        },

        renderTrending: function (trendings) {
            var $panel = $('#trending-panel'),
                $collection = $panel.find('.collection'),
                $noStock = $panel.find('.no-stock');

            $collection.empty();

            if (!trendings || trendings.length === 0) {
                $collection.hide();
                $noStock.show();
                return;
            }

            $collection.hide();
            $noStock.hide();

            trendings.forEach((trending) => {
                var $stocksListItem;

                $stocksListItem = this.templates.stockItem({
                    isFavorite: false,
                    isNegative: (trending.change < 0),
                    displayName: trending.name + ' ' + trending.symbol,
                    stock: trending 
                });

                $collection.append($stocksListItem);
            });

            $collection.show();
        }
    };
}());