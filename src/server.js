const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
var {
  YoBitApi
} = require('./YoBitApi');
var {
  DB
} = require('./DbConnection');
var {
  MongoDriver
} = require('./MongoDriver');
require('dotenv').config();

const log4js = require('log4js');
log4js.configure({
  appenders: {
    everything: {
      type: 'file',
      filename: 'server-file.log',
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

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {
  polling: true
});

var api = new YoBitApi();
var db = new MongoDriver();

bot.onText(/\/start/, async(msg, match) => {
  await db.has_user(msg.from.id, function() {
    bot.sendMessage(msg.chat.id, "Please, select an option from the menu.");
  }, function(err) {
    logger.debug(err);
    bot.sendMessage(msg.chat.id, "Sorry, some trouble with DataBase");
  });
});

bot.onText(/\/favorites (.+)/, (msg, match) => {
  console.log('favorites');
  db.get_favorites(msg.from.id, function(res) {
    console.log(res[0]);
  });
});

bot.onText(/\/search (.+)/, async(msg, match) => {
  await (function() {
    console.log(match);
    if (match[1].length == 0) {
      console.log(match);
      bot.sendMessage(msg.chat.id, "Please, enter currency");
    }
    var currency = match[1];
    var options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{
              text: 'Add to favorites',
              callback_data: 'add_fav'
            },
            {
              text: 'Show data',
              callback_data: 'query_to_api'
            }
          ],
          [{
            text: 'Remove from favorites',
            callback_data: 'rm_fav'
          }, {
            text: 'Set range',
            callback_data: 'set_range'
          }]
        ]
      }),
      force_reply: true
    };
    bot.sendMessage(msg.chat.id, currency, options);
  }());
});

bot.on('callback_query', async function(msg) {
  await (function() {
    var currency = msg.message.text.toLowerCase().replaceAll(' ', '')
      .replaceAll('/', '_').replaceAll(',', '-');
    if (currency[0] == '-') {
      currency[0] == ''
    };
    if (currency[currency.length - 1] == '-') {
      currency[currency.length - 1] == ''
    };
    var currency_list = [];
    var temp = '';
    for (var i = 0; i <= currency.length; i++) {
      if (currency[i] == '-' || currency[i] == undefined) {
        currency_list.push(temp);
        temp = '';
      } else {
        temp += currency[i];
      }
    }
    api.check_valid(currency, function(response) {
      currency = response;
      switch (msg.data) {
        case 'query_to_api':
          api.ticker(currency, function(result) {
            console.log(currency);
            console.log(currency_list);
            var answer = '';
            for (var i = currency_list.length - 1; i >= 0; i--) {
              if (result[currency_list[i]]) {
                answer += 'Currency: ' + currency_list[i].toUpperCase().replace('_', '/') + '\n' +
                  'Last: ' + result[currency_list[i]].last + '\n' +
                  '24High: ' + result[currency_list[i]].high + '\n' +
                  '24Low: ' + result[currency_list[i]].low + '\n\n';
              }
              bot.answerCallbackQuery(msg.id, answer, true).catch(function(err) {
                logger.debug(err);
                //bot.answerCallbackQuery(msg.id, err.response.body.description, false);
                bot.sendMessage(msg.message.chat.id, answer);
              });
            }
          }, function(err) {
            logger.debug(err);
            bot.answerCallbackQuery(msg.id, 'All currency pairs are incorrect', true);
          });
          break;

        case 'add_fav':
          db.add_to_favorites(msg.from.id, currency_list, function(err) {
            logger.debug(err);
            bot.answerCallbackQuery(msg.id, "Sorry, some problem with DataBase");
          });
          break;

        case 'rm_fav':
          db.delete_favorites(msg.from.id, currency_list, function(err) {
            logger.debug(err);
            console.log(err);
            bot.answerCallbackQuery(msg.id, "Sorry, some problem with DataBase");
          });
          break;

        case 'set_range':
          var options = {
            reply_markup: {
              "force_reply": true
            }
          };
          var main_msg = msg;
          bot.sendMessage(msg.message.chat.id, 'Please send me the values using the format: MAX, MIN.', options)
            .then(function (success) {
              bot.on('message', async (msg) => {
                await (function () {
                  if (msg.reply_to_message && msg.reply_to_message.text == 'Please send me the values using the format: MAX, MIN.') {
                    db.set_range(msg.from.id, currency_list, msg.text, function () {
                      bot.answerCallbackQuery(main_msg.id, 'Range is set', true);
                    }, function (err) {
                      logger.debug(err);
                      bot.answerCallbackQuery(main_msg.id, 'Sorry, some problem with DataBase', true);
                    });
                  }
                }());
              });
            });
          break;
      }
    }, function(err) {
      console.log("Failure: " + err);
      bot.answerCallbackQuery(msg.id, err);
    });
  }());
});

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};
