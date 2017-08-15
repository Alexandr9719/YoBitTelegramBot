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
YoBitApi.prototype.ticker = function(currency, callback) {
	if (!currency) {callback("wrong input")}
	var options = {
		uri: this.ticker_uri+currency+'?ignore_invalid=1',

		headers:{
			'Content-Type': 'application/json'
		},

		json: true
	}
	console.log(options.uri);
	rp(options)
		.then(function(response) {
			console.log("###Response body###");
			console.log(Object.keys(response));
			console.log('###End response###');
			// return response;
			callback(response);
		})
		.catch(function(err) {
			console.log(err);
			// return err;
			callback('YoBit problem');
		})
};
YoBitApi.prototype.info = function(callback) {
	var options = {
		uri: this.info_uri,
		headers:{
			'Content-Type': 'application/json'
		},
		json: true
	}
	rp(options)
		.then(function(response) {
			callback(response);
		})
		.catch(function(err) {
			callback(err);
		})
};
YoBitApi.prototype.show_favorites = function(user_id, callback) {
	
};
YoBitApi.prototype.add_favorite = async function(user_id, currency, callback) {
	//const fav = await db.get('users').map(user_id).value();
};