var arr = [
	"btc/usd",
	"eth/usd",
	"dash/btc"
];
var obj = JSON.parse(JSON.stringify(arr));
console.log(Object.keys(obj));
