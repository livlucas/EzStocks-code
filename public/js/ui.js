(function () {
    "use strict";

    EZSTOCKS.ui = {
        toastDelayTime: 4000,

        auth: null,
        db: null,
        defaultPage: 'login-page',
        loggedPage: 'dashboard-page',

        navMenuConfig: {
            logged: ['dashboard', 'edit-account', 'user-name', 'logout'],
            anonymous: ['create-account', 'login']
        },

        //this is not used to generate the html
        securityQuestion: [
            "What is your pet’s name?",
            "In what city or town does your nearest sibling live?",
            "What's your best friends name?",
            "What's the name of your favorite city?",
            "Who is your childhood sports hero?",
            "What was the make and model of your first car?",
            "In what town was your first job?",
            "What was the name of the company where you had your first job?"
        ],

        templates:{},

        data: {
            favorites: null,
            trending: null,
            currentSearchResult: null,
            forgotPassword: {
                step: 1,
                questionIndex: null
            }
        },

        //==========[ initializations ]===========
        init: function (auth, db, api) {
            var pageToNav = this.defaultPage;

            this.auth = auth;
            this.db = db;
            this.api = api;

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
                this.updateNavMenuOnUserContext();
                this.updateForms();

                if (user) pageToNav = this.loggedPage;
                
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
        },

        compileTemplates: function () {
            var html;

            html = $('#stock-item-template').html();
            this.templates.stockItem = Handlebars.compile(html);

            html = $('#search-result-template').html();
            this.templates.searchResult = Handlebars.compile(html);

            html = $('#forgot-password-second-step-template').html();
            this.templates.forgotPasswordSecondStep = Handlebars.compile(html);
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

            $('body').on('click', '.js-nav-forgot-password', (e) => {
                e.preventDefault();
                this.navigateToPage('forgot-password-page');
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
                var $form = $(e.target);
                e.preventDefault();

                this.createAccountFormSubmit($form);
            });

            $('#forgot-password-form').on('submit', (e) => {
                var $form = $(e.target);
                e.preventDefault($form);

                this.forgotPasswordFormSubmit($form);
            });

            $('#login-form').on('submit', (e) => {
                var $form = $(e.target);
                e.preventDefault();

                this.loginFormSubmit($form);
            });

            $('#edit-account-form').on('submit', (e) => {
                var $form = $(e.target);
                e.preventDefault();

                this.editFormSubmit($form);
            });

            $('#favorites-panel').on('click', '.delete', (e) => {
                var $target = $(e.target),
                    symbol = $target.data('symbol');

                this.removeFavoriteStock(symbol);
            });

            $('#trending-panel').on('click', '.add-stock', (e) => {
                var $target = $(e.target),
                    symbol = $target.data('symbol'),
                    stock;

                stock = this.data.trending
                    .find((stock) => stock.Symbol === symbol);

                this.addFavoriteStock(stock);
            });

            $('#stock-search').on('focus', (e) => {
                e.target.select();
            });

            $('#stock-search').on('keydown', (e) => {
                var symbol;

                if (e.keyCode !== 13) return;

                symbol = $(e.target).val().trim();
                this.searchStockQuery(symbol);
            });

            $('#stock-search-result').on('click', '.backdrop-ezstocks', (e) => {
                this.hideSearchResult();
            });

            $('#stock-search-result .result-container').on('click', (e) =>{
                if (!this.data.currentSearchResult) return;

                this.addFavoriteStock(this.data.currentSearchResult);
                this.hideSearchResult();
                $('#stock-search').val('').focus();
            });
        },


        //==========[ app functions ]===========
        navigateToPage: function (pageId) {
            var $page = $('#' + pageId);

            if ($page.is(':visible')) return;

            this.updateNavMenu(pageId);
            this.updateForms();
            this.renderPage(pageId);

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

        updateData: function () {
            var user = this.auth.getLoggedUser();

            if (!user) return Promise.resolve();

            this._setFavorites(user.favorites || {});

            return this.db.getTrending()
                .then((trendings) => this._setTrending(trendings));
        },

        renderPage: function (pageId) {
            switch (pageId) {
                case 'dashboard-page':
                    this.updateData()
                    .then(() => {
                        this.renderFavorites();
                        this.renderTrending();
                    });
                break;
            }
        },

        setNavUsername: function () {
            var user = this.auth.getLoggedUser();

            if (!user) return;

            $('#nav-display-username').text(user.name);
            $('#mobile-nav-display-username').text(user.name);
        },

        updateForms: function () {
            var user = this.auth.getLoggedUser();

            if (!user) return;

            $('[type="submit"]').attr('disabled', false);

            this.clearLoginForm();
            this.clearSignUpForm();
            this.clearSearchForm();
            this.clearForgotPasswordForm();
            this.fillEditForm();
        },

        logoutUser: function () {
            this.auth.logout()
            .then(() => {
                this.updateNavMenuOnUserContext();
                Materialize.toast('Logged out succesfully', this.toastDelayTime);
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

        forgotPasswordFormSubmit: function ($form) {
            var values = $form.inputValues(),
                fp = this.data.forgotPassword,
                $submitButton = $form.find('[type="submit"]');

            $submitButton.attr('disabled', true);

            if (fp.step === 1) {
                this.auth.forgotPassword(values.email.trim())
                .then((result) => {
                    var question;

                    if (!result.success) {
                        $submitButton.attr('disabled', false);
                        Materialize.toast(
                            $('<span class="red-text text-lighten-4">Email not found</span>'),
                        this.toastDelayTime);
                        return;
                    }

                    fp.step = 2;
                    fp.questionIndex = parseInt(result.questionIndex, 10);

                    $form.find('.first-step').hide();

                    question = this.securityQuestion[fp.questionIndex - 1];
                    this.renderForgotPasswordSecondStep(question);
                });
            } else if (fp.step === 2) {
                values.questionIndex = fp.questionIndex;

                this.auth.resetPassword(values)
                .then((result) => {
                    if (!result.success) {
                        $submitButton.attr('disabled', false);
                        Materialize.toast(
                            $('<span class="red-text text-lighten-4">' + result.message + '</span>'),
                        this.toastDelayTime);
                        return;
                    }

                    this.auth
                    .login({
                        email: values.email,
                        password: values.newPassword
                    })
                    .then((user) => {
                        this.updateNavMenuOnUserContext();
                        this.navigateToPage('dashboard-page');

                        Materialize.toast('Password changed succesfully', this.toastDelayTime);
                    });
                });
            }
        },

        clearForgotPasswordForm: function () {
            $('#forgot-password-form')[0].reset();
            $('#forgot-password-form .second-step').empty();

            $('#forgot-password-form .first-step').show();

            this.data.forgotPassword.step = 1;
            this.data.forgotPassword.question = null;
        },

        loginFormSubmit: function ($form) {
            var userData = this.getLoginInformation(),
                $submitButton = $form.find('[type="submit"]');

            this.auth
            .login(userData)
            .then((user) => {
                if (!user) {
                    $('#login-form input[text]:first').focus();
                    $submitButton.attr('disabled', false);

                    Materialize.toast('Invalid email or password', this.toastDelayTime);
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

        clearSearchForm: function () {
            $('#stock-search').val('');
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

        editFormSubmit: function ($form) {
            var user, uid,
                $submitButton = $form.find('[type="submit"]');

            $submitButton.attr('disabled', true);

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
                Materialize.toast('Updated succesfully', this.toastDelayTime);
            });
        },

        createAccountFormSubmit: function ($form) {
            var user = this.getNewAccontInformation(),
                $submitButton = $form.find('[type="submit"]');

            $submitButton.attr('disabled', true);

            this.auth
            .createUser(user)
            .then(() => {
                this.updateNavMenuOnUserContext();
                this.navigateToPage(this.loggedPage);
            });
        },

        searchStockQuery: function (symbol) {
            this.api
            .queryBySymbol(symbol)
            .then((stock) => {
                if (stock === null) {
                    $('#stock-search-result .result-container').empty();
                    $('#no-search-result').removeClass('hide');
                    this.showSearchResult(false);
                    return;
                }

                this.data.currentSearchResult = stock;
                this.renderSearchResult(stock);
                this.showSearchResult(true);

                try {
                    this.db.increaseTrendingScore(stock);
                } catch (e) {
                    console.log('Error updating trending score', e, stock);
                }
            })
        },

        addFavoriteStock: function (stock) {
            var user = this.auth.getLoggedUser(),
                uid;

            if (!user) return;

            if (!user.favorites) user.favorites = {};

            if (user.favorites.hasOwnProperty(stock.Symbol)) {
                Materialize.toast(stock.Name + " already in favorites.", this.toastDelayTime);
                return;
            }

            user.favorites[stock.Symbol] = stock;
            uid = this.auth.getLoggedUserUid();

            this.db.saveUser(user, uid)
            .then(() => {
                Materialize.toast(stock.Name + " added to favorite.", this.toastDelayTime);

                this._addFavorite(stock);
                this.renderFavorites();
            });
        },

        removeFavoriteStock: function (symbol) {
            var user = this.auth.getLoggedUser(),
                uid = this.auth.getLoggedUserUid(),
                stock;

            if (!user) return;

            stock = user.favorites[symbol];
            if (!stock) return;

            delete user.favorites[symbol];

            this.db.saveUser(user, uid)
            .then(() =>{
                Materialize.toast(symbol + ' removed from favorites.', this.toastDelayTime);
                this._removeFavorite(stock);
                this.renderFavorites();
            });
        },

        _setFavorites: function (favorites) {
            this._setDatalist('favorites', favorites);
        },

        _setTrending: function (trendings) {
            this.data.trending = trendings;
        },

        _setDatalist: function (list, stocks) {
            this.data[list] = [];

            if (!stocks || Object.keys(stocks).length === 0) return;

            Object.keys(stocks).forEach((key) => {
                this.data[list].push(stocks[key]);
            });
        },

        _addFavorite: function (stock) {
            this.data.favorites = [stock].concat(this.data.favorites || []);
        },

        _removeFavorite: function (stock) {
            var i = this.data.favorites.indexOf(stock);

            this.data.favorites = this.data.favorites.slice(0, i)
                .concat(this.data.favorites.slice(i + 1));
        },

        showSearchResult: function (hasResult) {
            if (hasResult) $('#no-search-result').addClass('hide');
            else $('#no-search-result').remove('hide');

            $('#stock-search-result').removeClass('hide');
        },

        hideSearchResult: function () {
            $('#stock-search-result').addClass('hide');
        },


        //==========[ render functions ]===========
        renderFavorites: function () {
            var stocks = this.data.favorites,
                $panel = $('#favorites-panel'),
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
                    isNegative: (stock.Change < 0),
                    stock: stock 
                });

                $collection.append($stocksListItem);
            });

            $collection.show();
        },

        renderTrending: function () {
            var trendings = this.data.trending,
                $panel = $('#trending-panel'),
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
                    isNegative: (trending.Change < 0),
                    stock: trending 
                });

                $collection.append($stocksListItem);
            });

            $collection.show();
        },

        renderSearchResult: function (stock) {
            var $container = $('#stock-search-result .result-container'),
                html;
                
            $container.empty();

            html = this.templates.searchResult({
                isNegative: (stock.Change < 0),
                stock: stock
            });

            $container.append(html);
        },

        renderForgotPasswordSecondStep: function (question) {
            var $container = $('#forgot-password-form .second-step'),
                html;
                
            $container.empty();

            html = this.templates.forgotPasswordSecondStep({
                question: question
            });

            $container.append(html);
        }
    };
}());