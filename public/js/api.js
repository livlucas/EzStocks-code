(function () {
    "use strict";

    EZSTOCKS.api = {
        $: null, //jQuery dependency

        endpoint: null,
        stockReference: null,
        searchReference: null,

        defaultData: null,

        init: function (config, jQuery) {
            this.endpoint = config.endpoint;
            this.searchReference = config.searchReference;
            this.stockReference = config.stockReference;
            this.defaultData = config.data;

            this.$ = jQuery;
        },

        _buildQuery: function (reference, key, constraint) {
            var query = 'select * from ' + reference;                

            query += ' where ' + key + '=' + constraint;

            return query;
        },

        queryByName: function (str) {
            var query;

            str = '"' + str + '"';

            query = this._buildQuery(this.searchReference, 'auto_complete_str', str);

            return this._apiCall(query);
        },

        queryBySymbol: function (symbol) {
            var query;

            symbol = '"' + symbol.toLowerCase()  +'"';

            query = this._buildQuery(this.stockReference, 'symbol', symbol);

            return this._apiCall(query)
                .then((result) => {
                    var stock;

                    if (result.query.count === 0) return null;

                    stock = result.query.results.quote;

                    if (stock.Name === null) return null;

                    return this._castCurrencyFields(stock);
                });
        },

        _apiCall: function (query) {
            var data = Object.assign({
                q: query
            }, this.defaultData);

            return this.$.get(this.endpoint, data);
        },

        _castCurrencyFields: function (stock) {
            stock.Change = parseFloat(stock.Change);
            stock.DaysHigh = parseFloat(stock.DaysHigh);
            stock.DaysLow = parseFloat(stock.DaysLow);
            stock.LastTradePriceOnly = parseFloat(stock.LastTradePriceOnly);
            stock.MarketCapitalization = stock.MarketCapitalization ? parseFloat(stock.MarketCapitalization) : null;
            stock.Volume = parseInt(stock.Volume, 10);
            stock.YearHigh = parseFloat(stock.YearHigh);
            stock.YearLow = parseFloat(stock.YearLow);

            return stock;
        }
    };
}());

