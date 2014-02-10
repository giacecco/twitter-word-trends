var csv = require("csv"),
	db = { };

exports.initialise = function (callback) {
	callback(null);
}

exports.writeWords = function (words, callback) {
	words.forEach(function (word) {
		if (typeof(db[word.created_at]) === "undefined") {
			db[word.created_at] = { }
		} 
		db[word.created_at][word.word] = (db[word.created_at][word.word] || 0) + 1;
	});
	if (callback) callback(null);
}

exports.toCSV = function (callback) {
	var allWords = Object.keys(db).reduce(function (memo, timestamp) {
		var wordsInTimestamp = Object.keys(db[timestamp]);
		return wordsInTimestamp.reduce(function (memo2, word) {
			return memo2.indexOf(word) === -1 ? memo2.concat(word) : memo2;
		}, memo);
	}, [ ]).sort();
	csv()
		.from.array(Object.keys(db).map(function (timestamp) {
			var temp = db[timestamp];
			temp.timestamp = timestamp;
			return temp;
		}).sort(function (a, b) { return a.timestamp - b.timestamp; }))
		.to.string(function (data, count) {
			callback(null, data);
		}, {
			header: true, 
			columns: [ "timestamp"].concat(allWords)
		});
}