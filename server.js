const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
var {YoBitApi} = require('./YoBitApi');
var {DB} = require('./DbConnection');
// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
const token = "413554912:AAFX5jfOM_7b3GC1GfVfAsrQIlKEc2tDNjU";
const bot = new TelegramBot(token, {polling: true});

var api = new YoBitApi();
var db = new DB();

var symbols = {
	fav: "\u2764",
	search: "\uD83D\uDD0D",
	back: "\uD83D\uDD19"
}

bot.onText(/\/start/, (msg, match)=> {
	console.log('Start');
	db.has_user(msg.from.id);
	bot.sendMessage(msg.chat.id, "Please, select an option from the menu.");
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  api.ticker(match[1], function(result) {
  	console.log(result);
  	bot.sendMessage(msg.chat.id, typeof result);
  });
});

bot.onText(/\/search (.+)/, (msg, match) => {
	if (!match[1]) {
		console.log(match);
		bot.sendMessage(msg.chat.id, "Please, enter currency");
	}
	console.log('Search');
	var currency = match[1];
	var options = {
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: 'Add to favorite', callback_data: 'add_fav'}, {text: 'Show data', callback_data: 'query_to_api'}]
			]
		})
	};
	bot.sendMessage(msg.chat.id, currency, options);
});

bot.on('callback_query', function (msg) {
  console.log(Object.keys(msg)); // msg.data refers to the callback_data
  var currency = msg.message.text.toLowerCase().replaceAll(' ', '').replaceAll('/', '_').replaceAll(',', '-')
  switch(msg.data){
  	case 'query_to_api': 
  		api.ticker(currency, function(result) {
  			console.log(result);
  			if (result.success === 0) {
  				console.log('wrong query');
  				bot.answerCallbackQuery(msg.id, "Wrong query", true);
  			}
  			else {
  				currency = [];
  				var answer = '';
  				for (var i = Object.keys(result).length - 1; i >= 0; i--) {
  					currency[i] = Object.keys(result)[i];
  				}
  				//result = result[currency];
  				for (var i = currency.length - 1; i >= 0; i--) {
  					answer += 'Currency: ' + currency[i].toUpperCase().replace('_', '/') + '\n' +
  					           'Last: ' + result[currency[i]].last + '\n' +
  					           '24High: ' + result[currency[i]].high + '\n'+
  					           '24Low: ' + result[currency[i]].low + '\n\n';
  				}
  				bot.answerCallbackQuery(msg.id, answer, true).catch(function(err) {
  					console.log(err.response.body.description);
  					bot.answerCallbackQuery(msg.id, err.response.body.description, true);
  				});
  			}
  		});
  		break;
  	case 'add_fav':
  			
  		break;	
  }
});

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
};