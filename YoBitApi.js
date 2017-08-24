const http = require('http');
var rp = require('request-promise');
var cron = require('cron').CronJob;

function YoBitApi() {
    this.info_uri = 'https://yobit.net/api/3/info/';
    this.depth_uri = 'https://yobit.net/api/3/depth/';
    this.ticker_uri = 'https://yobit.net/api/3/ticker/';
    this.trades_uri = 'https://yobit.net/api/3/trades/';
};
exports.YoBitApi = YoBitApi;
YoBitApi.prototype.ticker = async function(currency, callback, failure) {
    var options = {
        uri: this.ticker_uri + currency,

        headers: {
            'Content-Type': 'application/json'
        },

        json: true
    }
    console.log("ticker uri: " + options.uri);
    await rp(options)
        .then(function(response) {
            callback(response);
        }, function(err) { console.log(err); failure(err)});
};
YoBitApi.prototype.info = async function(callback) {
    var options = {
        uri: this.info_uri,
        headers: {
            'Content-Type': 'application/json'
        },
        json: true
    }
    await rp(options)
        .then(function(response) {
            callback(response);
        })
        .catch(function(err) {
            throw err;
        })
};
YoBitApi.prototype.check_valid = async function(currency_list, callback, failure) {
    var self = this;
    async function query(currency) {
        if (!currency) { console.log('repair all invalid_pair');
            failure('All currency pairs are incorrect'); } else {
            var options = {
                uri: self.ticker_uri + currency,
                headers: {
                    'Content-Type': 'application/json'
                },
                json: true
            }
            console.log("check_valid uri: " + options.uri);
            await rp(options)
                .then(function(response) {
                    if (response.success == 0) {
                        console.log(response);
                        var invalid_pair = response.error.substring(response.error.indexOf(':')).substring(2);
                        //console.log("invalid pair: " + response.error.substring(response.error.indexOf(':')).substring(2).length);
                        //console.log("Index item: " + currency.indexOf(response.error.substring(response.error.indexOf(':')).substring(2).trim()));
                        currency = currency.replace(invalid_pair, '');
                        if (currency[0] == '-' || currency[currency.length - 1] == '-')
                            currency = currency.replace('-', ' ').trim().replace(' ', '-');
                        console.log("new query string " + currency);
                        query(currency);
                    } else {
                        console.log('return: ' + Object.keys(response));
                        console.log(currency);
                        callback(currency);
                    }
                }, function(err) { console.log(err); failure(err); });
        }
    }
    await query(currency_list);
    // console.log('callback check_valid: ' + currency_list);
    // process.exit();
    // callback(currency_list);
};