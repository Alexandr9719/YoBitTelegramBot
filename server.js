const TelegramBot = require('node-telegram-bot-api');
const lowdb = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async')
const http = require('http');
var {YoBitApi} = require('./YoBitApi');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

const token = "413554912:AAFX5jfOM_7b3GC1GfVfAsrQIlKEc2tDNjU";
const bot = new TelegramBot(token, {polling: true});

const db = lowdb('db.json', {
	storage: fileAsync
});

var api = new YoBitApi();

bot.onText(/\/start/, (msg, match)=> {

	const options = {
		reply_markup: JSON.stringify({
			keyboard: [
				['Favorites'],
				['Last']
			]
		})
	};
	bot.sendMessage(msg.chat.id, "Hello", options);
});

// function YoBit(currency) {
// 	const host = 'yobit.net';
// 	let path = "/api/3/ticker/"+currency.toString();
// 	var options = {
// 		hostname: host,
// 		port: 80,
// 		path: path,
// 		method: 'POST',
// 		headers:{
// 			'Content-Type': 'application/json'
// 		}
// 	};
// 	var req = http.request(options, function(res) {
// 		res.setEncoding('utf8');
// 		res.on('data', function (data) {
// 	    	console.log(data);
// 	    	let response_json = JSON.parse(data);
// 	    	console.log(response_json[currency]);
// 		});
// 	});
// 	req.on('error', function(e) {
// 	  console.log('problem with request: ' + e.message);
// 	});
// 	req.end();
// 	return "Done";
// }

bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  var result;
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  var promise = new Promise(function(resolve, reject) {
  	var result = api.ticker(resp);
  	if (typeof result == 'object' && result[Object.keys(result)[0]] !== 'undefined') {
  		Object.keys(value);
  		resolve(result);
  	}
  	else
  		reject(result);
  });
  promise.then(function(value) {
  	bot.sendMessage(chatId, "JSON");
  	console.log(Object.keys(value));
  }, function(reason) {
  	bot.sendMessage(chatId, result);
  });
  // send back the matched "whatever" to the chat
  
});

bot.onText(/\/love/, function onLoveText(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, you are the bot of my life ❤'],
        ['No, sorry there is another one...']
      ]
    })
  };
  bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
});
