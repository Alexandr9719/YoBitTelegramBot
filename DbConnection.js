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
	const user = this.db.get('users').find({id: user_id}).value;
	console.log(Object.keys(user));
	if (user.length === 0) {
		await this.db.get('users')
			.push({'id': user_id}).write();
	}
	console.log(user);
};
DB.prototype.has_user_currency = function(user_id, currency) {
	
};