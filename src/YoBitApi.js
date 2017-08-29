const http = require('http');
var rp = require('request-promise');
var cron = require('cron').CronJob;
const log4js = require('log4js');
log4js.configure({
  appenders: {
    everything: {
      type: 'file',
      filename: 'YoBitApi-file.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true
    }
  },
  categories: {
    default: {
      appenders: ['everything'],
      level: 'debug'
    }
  }
});
const logger = log4js.getLogger();

function YoBitApi() {
  this.info_uri = 'https://yobit.net/api/3/info/';
  this.depth_uri = 'https://yobit.net/api/3/depth/';
  this.ticker_uri = 'https://yobit.net/api/3/ticker/';
  this.trades_uri = 'https://yobit.net/api/3/trades/';
};
exports.YoBitApi = YoBitApi;
YoBitApi.prototype.ticker = async function(currency, success, failure) {
  var options = {
    uri: this.ticker_uri + currency,

    headers: {
      'Content-Type': 'application/json'
    },

    json: true
  }
  await rp(options)
    .then(function(response) {
      success(response);
    }, function(err) {
      logger.debug(err);
      failure(err)
    });
};
YoBitApi.prototype.info = async function(success) {
  var options = {
    uri: this.info_uri,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true
  }
  await rp(options)
    .then(function(response) {
      success(response);
    })
    .catch(function(err) {
      logger.debug(err);
      throw err;
    })
};
YoBitApi.prototype.check_valid = async function(currency_list, success, failure) {
  var self = this;
  async function query(currency) {
    if (!currency) {
      ('repair all invalid_pair');
      failure('All currency pairs are incorrect');
    } else {
      var options = {
        uri: self.ticker_uri + currency,
        headers: {
          'Content-Type': 'application/json'
        },
        json: true
      }
      await rp(options)
        .then(function(response) {
          if (response.success == 0) {
            (response);
            var invalid_pair = response.error.substring(response.error.indexOf(':')).substring(2);
            currency = currency.replace(invalid_pair, '');
            if (currency[0] == '-' || currency[currency.length - 1] == '-')
              currency = currency.replace('-', ' ').trim().replace(' ', '-');
            query(currency);
          } else {
            success(currency);
          }
        }, function(err) {
          logger.debug(err);
          failure(err);
        });
    }
  }
  await query(currency_list);
};
YoBitApi.prototype.queries_handler = async function (user_id, success, failure) {
  await (async function () {

  }());
};
