var MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

function MongoDriver() {
	//var example url = "mongodb://localhost:27017/YoBotAssistant";
	this.url = "mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_COLLECTION_NAME;
	try{
		MongoClient.connect(this.url, function(err, db) {
			if (err) {console.log(err); console.log('connect'); throw err;}
			db.createCollection("users", function(err, res) {
				if (err) {console.log(err); console.log('createCollection'); throw err;}
				console.log('Collection created');
				db.close();
			});
		});
	}catch(e){
		console.log(e.message);
	}
}
exports.MongoDriver = MongoDriver;
MongoDriver.prototype.has_user = async function(user_id) {
	await MongoClient.connect(this.url, function(err, db) {
		if (err) {console.log(err); console.log('has_user.connect'); throw err;}
		db.collection('users').findOne({_id: user_id}, function(err, res) {
			if (err) {console.log(err); console.log('findOne'); throw err;}
			console.log(res);
			if (res == null) {
				var user = {_id: user_id, favorites: {}};
				db.collection('users').insertOne(user)
					.then(null, function(err) {console.log(err);});
			}
			db.close();
		});
	});
};
MongoDriver.prototype.add_to_favorites = async function(user_id, currency_list) {
	var self = this;
	self.get_favorites(user_id, await function(res) {
		MongoClient.connect(self.url, function(err, db) {
			if(err) {console.log(err); throw err;}
			var fav_list = currency_list.reduce(function(acc, cur, i) {
				acc[cur] = {
					last: null,
					min: null,
					max: null
				};
				return acc;
			}, {});
			Object.assign(fav_list, res);
			console.log(fav_list);
			db.collection('users').update({_id: user_id}, {$set:{favorites: fav_list}})
				.then(null, function(err) {console.log(err); throw err;});
			db.close();
		});
	});

};
MongoDriver.prototype.get_favorites = async function(user_id, callback) {
	await MongoClient.connect(this.url, function(err, db) {
		if (err) {console.log(err); throw err;}
		db.collection('users').findOne({_id: user_id}, function(err, res) {
			if (err) {console.log(err); throw err;}
			db.close();
			callback(res.favorites);
		});
	});
};
MongoDriver.prototype.delete_favorites = async function(user_id, currency_list) {
	var self = this;
	self.get_favorites(user_id, await function(res) {
		console.log('Delete favorites function');
		console.log("Fav from db: " + Object.keys(res));
		console.log("What delete: " + Array.isArray(currency_list));
		for (var i = 0; i < currency_list.length; i++) {
			for (key in res) {
				if (currency_list[i] === key) {
					console.log("Pair: " + currency_list[i] + " and " + key);
					delete res[key];}
			}
		}
		console.log("Result: " + Object.keys(res));
		MongoClient.connect(self.url, function(err, db) {
			if(err){console.log(err); throw err;}
			db.collection('users').update({_id: user_id}, {$set: {favorites: res}});
			db.close();
		});
	});
};
MongoDriver.prototype.change_max = function(user_id, currency_list, max, callback) {
	
};
