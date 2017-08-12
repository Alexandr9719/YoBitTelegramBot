const http = require('http');
function YoBitApi() {
	this.host = 'yobit.net';
};
exports.YoBitApi = YoBitApi;
YoBitApi.prototype.ticker = function(currency) {
	var response_json = {};
	let path = "/api/3/ticker/"+currency.toString();
	var options = {
		hostname: this.host,
		port: 80,
		path: path,
		method: 'POST',
		headers:{
			'Content-Type': 'application/json'
		}
	};
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (data) {
	    	response_json = JSON.parse(data);
		});
	});
	req.on('error', function(e) {
	  	console.log('problem with request: ' + e.message);
	  	return (e.message);
	});
	req.end();
	return response_json;

	// var req;
	// var promise = new Promise(function(resolve, reject) {
	// 	req = http.request(options, function(res) {
	// 		res.setEncoding('utf8');
	// 		res.on('data', function (data) {
	//     		response_json = JSON.parse(data);
	//     		console.log(response_json);
	// 		});
	// 	});
	// 	req.on('error', function(e) {
	//   		console.log('problem with request: ' + e.message);
	//   		reject(e.message);
	// 	});
	// 	resolve(response_json);
	// });
	// promise.then(function(value) {
	// 	req.end();
	// 	return value;
	// }, function(reason) {
	// 	req.end();
	// 	return reason;
	// })
	
};