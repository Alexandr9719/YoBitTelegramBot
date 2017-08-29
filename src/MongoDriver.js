var MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const log4js = require('log4js');
log4js.configure({
  appenders: {
    everything: {
      type: 'file',
      filename: 'MongoDriver-file.log',
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

function MongoDriver() {
  //var example url = "mongodb://localhost:27017/YoBotAssistant";
  this.url = "mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT + "/" + process.env.DB_COLLECTION_NAME;
  MongoClient.connect(this.url, function(err, db) {
    if (err) {
      logger.debug(err);
      process.exit();
    }
		else {
			db.createCollection("users", function(err, res) {
				if (err) {
					logger.debug(err);
				}else {
					db.close();
				}
			});
		}
  });
}

exports.MongoDriver = MongoDriver;

MongoDriver.prototype.has_user = async function(user_id, success, failure) {
  await MongoClient.connect(this.url, function(err, db) {
    if (err) {
      logger.debug(err);
      failure(err);
    } else {
      db.collection('users').findOne({
        _id: user_id
      }, function(err, res) {
        if (err) {
          logger.debug(err);
          failure(err);
        } else {
          if (res == null) {
            var user = {
              _id: user_id,
              favorites: {}
            };
            db.collection('users').insertOne(user)
              .then(null, function(err) {
                logger.debug(err);
                failure(err);
              });
          }
          success();
          db.close();
        }
      });
    }
  });
};

MongoDriver.prototype.add_to_favorites = async function(user_id, currency_list, failure) {
  var self = this;
  self.get_favorites(user_id, await
    function(res) {
      MongoClient.connect(self.url, function(err, db) {
        if (err) {
          logger.debug(err);
          failure(err);
        } else {
          var fav_list = currency_list.reduce(function(acc, cur, i) {
            acc[cur] = {
              last: null,
              min: null,
              max: null
            };
            return acc;
          }, {});
          Object.assign(fav_list, res);
          db.collection('users').update({
              _id: user_id
            }, {
              $set: {
                favorites: fav_list
              }
            })
            .then(function(response) {
              db.close();
            }, function(err) {
              logger.debug(err);
              db.close();
              failure(err);
            });
        }
      });
    }, await function (err) {
      failure(err);
    });
};

MongoDriver.prototype.get_favorites = async function(user_id, success, failure) {
  await MongoClient.connect(this.url, function(err, db) {
    if (err) {
      logger.debug(err);
      failure(err);
    } else {
      db.collection('users').findOne({
        _id: user_id
      }, function(err, res) {
        if (err) {
          logger.debug(err);
          db.close();
          failure(err);
        }else {
          db.close();
          success(res.favorites);
        }
      });
    }
  });
};

MongoDriver.prototype.delete_favorites = async function(user_id, currency_list, failure) {
  var self = this;
  self.get_favorites(user_id, await
    function(res) {
      console.log('Delete favorites function');
      console.log("Fav from db: " + Object.keys(res));
      console.log("What delete: " + Array.isArray(currency_list));
      for (var i = 0; i < currency_list.length; i++) {
        for (key in res) {
          if (currency_list[i] === key) {
            console.log("Pair: " + currency_list[i] + " and " + key);
            delete res[key];
          }
        }
      }
      console.log("Result: " + Object.keys(res));
      MongoClient.connect(self.url, function(err, db) {
        if (err) {
          logger.debug(err);
          failure(err);
        } else {
          db.collection('users').update({
            _id: user_id
          }, {
            $set: {
              favorites: res
            }
          }).then(function(response) {
            db.close();
          }, function(err) {
            failure(err);
            db.close();
          });
        }
      });
    },
    await function(err) {
      failure(err);
    });
};

MongoDriver.prototype.set_range = async function (user_id, currency_list, range, success, failure) {
  var self = this;
  self.get_favorites(user_id, await function (res) {
    for (item of currency_list) {
      if(res[item]){
        console.log(res[item]);
      }
    }
    success();
  }, await function (err) {
    failure(err);
  });
};
