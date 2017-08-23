const lowdb = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');

function DB() {
	this.db = lowdb('db.json', {
		storage: fileAsync
	});	
	if (!this.db.has('users').value()) {
		this.db.set('users', []).write();
	}
}
exports.DB = DB;
DB.prototype.has_user = async function(user_id) {
	const user = this.db.get('users').find({ id: user_id }).value();
	console.log(user);
	if (user === undefined) {
		await this.db.get('users')
			.push({'id': user_id}).set('fav', {}).write();
	}
};
DB.prototype.has_user_currency = function(user_id, currency) {
	
};
DB.prototype.add_currency = async function(user_id, currency) {
	try{
		var temp = await this.db.get('users').find({id: user_id}).value();
		console.log(temp);
	}
	catch(e){
		console.log(e.message);
	}
};