const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
var {YoBitApi} = require('./YoBitApi');
var {DB} = require('./DbConnection');
var {MongoDriver} = require('./MongoDriver');
require('dotenv').config();
// var async = require('asyncawait/async');
// var await = require('asyncawait/await');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

var api = new YoBitApi();
var db = new MongoDriver();;

var symbols = {
	fav: "\u2764",
	search: "\uD83D\uDD0D",
	back: "\uD83D\uDD19"
}

bot.onText(/\/start/, (msg, match)=> {
	try{
		db.has_user(msg.from.id);
		bot.sendMessage(msg.chat.id, "Please, select an option from the menu.");
	}catch(e){
		bot.sendMessage(msg.chat.id, "Sorry, some trouble with DataBase");
	}
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

bot.onText(/\/fav (.+)/, (msg, match) => {
	console.log('favorites');
	db.get_favorites(msg.from.id, function(res) {console.log(res[0]);});
});

bot.onText(/\/search (.+)/, (msg, match) => {
	if (!match[1]) {
		console.log(match);
		bot.sendMessage(msg.chat.id, "Please, enter currency");
	}
	var currency = match[1];
	var options = {
		reply_markup: JSON.stringify({
			inline_keyboard: [
				[{text: 'Add to favorites', callback_data: 'add_fav'}, {text: 'Show data', callback_data: 'query_to_api'}],
				[{text: 'Remove from favorites', callback_data: 'rm_fav'}]
			]
		})
	};
	bot.sendMessage(msg.chat.id, currency, options);
});

bot.on('callback_query', function (msg) {
  //console.log(Object.keys(msg)); // msg.data refers to the callback_data
  var currency = msg.message.text.toLowerCase().replaceAll(' ', '').replaceAll('/', '_').replaceAll(',', '-');
  if (currency[0] == '-') {currency[0] == ''};
  if (currency[currency.length-1] == '-') {currency[currency.length-1] == ''};
  //console.log(currency);
  var currency_list = [];
  var temp = '';
  for (var i = 0; i <= currency.length; i++) {
  	if (currency[i] == '-' || currency[i] == undefined) {
  		currency_list.push(temp);
  		temp = '';
  	}
  	else{
  		temp += currency[i];
  	}
  }
  console.log(currency_list);
  console.log(currency);
  api.check_valid(currency, function(response) {
  	currency_list = response;
  	switch(msg.data){
  	case 'query_to_api': 
  		try{
  			api.ticker(currency, function(result) {
  		  			console.log(result);
  		  			if (result.success === 0) {
  		  				console.log('wrong query');
  		  				bot.answerCallbackQuery(msg.id, "Wrong query", true);
  		  			}
  		  			else {
  		  				var answer = '';
  		  				for (var i = currency_list.length - 1; i >= 0; i--) {
  		  					if (result[currency_list[i]]) {
  		  						  answer += 'Currency: ' + currency_list[i].toUpperCase().replace('_', '/') + '\n' +
  		  					      			'Last: ' + result[currency_list[i]].last + '\n' +
  		  					           		'24High: ' + result[currency_list[i]].high + '\n'+
  		  					           		'24Low: ' + result[currency_list[i]].low + '\n\n';
  		  					}
  		  				}
  		  				bot.answerCallbackQuery(msg.id, answer, true).catch(function(err) {
  		  					console.log(err.response.body.description);
  		  					bot.answerCallbackQuery(msg.id, err.response.body.description, true);
  		  				});
  		  			}
  		  		});
  		}catch(e){bot.answerCallbackQuery(msg.id, "Sorry, some problem with YoBit service");}
  		break;
  	case 'add_fav':
  		try{
  			db.add_to_favorites(msg.from.id, currency_list);
  		}catch(e){bot.answerCallbackQuery(msg.id, "Sorry, some problem with DataBase");}
  		break;
  	case 'rm_fav':
  		try{
  			db.delete_favorites(msg.from.id, currency_list, function() {});
  		}catch(e){console.log(e.message);}
  		break;
  }
  });
});

String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.split(search).join(replacement);
};