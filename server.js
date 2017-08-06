var cron = require('node-cron');
var admin = require('firebase-admin');
var https = require('https');
const querystring = require('querystring');

var serviceAccount = require("./testproject-hk-firebase-adminsdk-awgud-35d6b45726.json");

var api = {
    endpoint: 'https://query.yahooapis.com/v1/public/yql',
    reference: 'yahoo.finance.quote',

    defaultData: {
        format: 'json',
        env: 'store://datatables.org/alltableswithkeys'
    },

    _buildQuery: function (symbols) {
        var query = 'select * from ' + this.reference;                

        query += ' where symbol in ("' + symbols.join('","') + '")';

        return query;
    },

    query: function (symbols) {
        var query;

        query = this._buildQuery(symbols);

        return this._apiCall(query)
            .then((result) => {
                var stocks;

                result = JSON.parse(result);

                console.log("result", result);

                if (result.query.count === 0) return null;

                stocks = result.query.results.quote;

                stocks.forEach((stock) => this._castCurrencyFields(stock));

                return stocks;
            });
    },

    _apiCall: function (query) {
        var data = Object.assign({
            q: query
        }, this.defaultData);

        return new Promise((resolve, reject) => {
            // select http or https module, depending on reqested url
            const request = https.get(this.endpoint + '?' + querystring.stringify(data), (response) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                // temporary data holder
                const body = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => resolve(body.join('')));
            });
            // handle connection errors of the request
            request.on('error', (err) => reject(err))
        });
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://testproject-hk.firebaseio.com"
});

var updateStockData = function () {
    admin.database().ref('/stocks')
    .once('value')
    .then((dbs) => {
        var stocks = dbs.val(),
            symbols = [];

        Object.keys(stocks).forEach((key) => {
            symbols.push(stocks[key].Symbol);
        });

        if (symbols.length === 0) return;

        api.query(symbols)
        .then((updatedStocks) => {


            updatedStocks.forEach((stock) => {
                stock.trendingScore = stocks[stock.Symbol].trendingScore;

                stocks[stock.Symbol] = stock;
            });

            admin.database().ref('/stocks').set(stocks);
        });
    });
};

updateStockData();
cron.schedule('* * */6 * * *', updateStockData);