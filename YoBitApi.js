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
YoBitApi.prototype.ticker = async function(currency, callback) {
	if (!currency) {callback("wrong input")}
	var options = {
		uri: this.ticker_uri+currency,

		headers:{
			'Content-Type': 'application/json'
		},

		json: true
	}
	console.log(options.uri);
	await rp(options)
		.then(function(response) {
			if(response.success == 0){throw "Bad request";}
			callback(response);
		})
		.catch(function(err) {
			console.log(err);
			throw err;
		})
};
YoBitApi.prototype.info = async function(callback) {
	var options = {
		uri: this.info_uri,
		headers:{
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
YoBitApi.prototype.check_valid = async function(currency_list, callback) {
	var self = this;
	async function query(local_currency) { //replace func -> promise
		var options = {
			uri: this.ticker_uri + currency_list,
			headers:{
				'Content-Type': 'application/json'
			},
			json: true
		}	
	await rp(options)
		.then(function(response) {
			if (response.success == 0) {
				console.log(response);
				var invalid_pair = response.error.substring(response.error.indexOf(':')).substring(2);
				//console.log("invalid pair: " + response.error.substring(response.error.indexOf(':')).substring(2).length);
				//console.log("Index item: " + currency_list.indexOf(response.error.substring(response.error.indexOf(':')).substring(2).trim()));
				currency_list = currency_list.replace(invalid_pair, '');
				if (currency_list[0] ==  '-' || currency_list[currency_list.length-1] == '-')
					currency_list = currency_list.replace('-', ' ').trim().replace(' ', '-');				
				console.log("new query string " + currency_list);
				self.check_valid(currency_list);
			}
			else{
				callback(currency_list);
			}
		}, function(err) {callback('Wrong query');});
	}	
};