var csv = require("csv"),
    util = require("./util"),
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

exports.toCSV = function (options, callback) {
	var totals = { },
		allWords;
	if (options.limit) {
		// I want a report of the top options.limit words, possibly including
		// a 'others' category
		Object.keys(db).forEach(function (timestamp) {
			Object.keys(db[timestamp]).forEach(function (word) {
				if (!totals[word]) totals[word] = 0;
				totals[word]++;
			});
		});
		totals = Object.keys(totals).map(function (word) {
			return { word: word, total: totals[word] };
		}).sort(function (a, b) { return a - b; }).slice(0, options.limit - (options.other ? 1 : 0));
		allWords = totals.map(function (t) { return t.word; });
		if (options.other) {
			allWords = allWords.concat("other");
			Object.keys(db).forEach(function (timestamp) {
				db[timestamp]["other"] = Object.keys(db[timestamp])
					.filter(function (word) { return allWords.indexOf(word) === -1; })
					.reduce(function (memo, word) {
						return memo + db[timestamp][word];
					}, 0);
			});
		}
	} else {
		// I want a full report
		allWords = Object.keys(db).reduce(function (memo, timestamp) {
			var wordsInTimestamp = Object.keys(db[timestamp]);
			return wordsInTimestamp.reduce(function (memo2, word) {
				return memo2.indexOf(word) === -1 ? memo2.concat(word) : memo2;
			}, memo);
		}, [ ]).sort();
	}
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

exports.purge = function (earliestDateToKeep, callback) {
	var earliestTimestampToKeep = util.date2Timestamp(earliestDateToKeep);
    Object.keys(db)
        .filter(function (key) { return key < earliestTimestampToKeep; })
        .forEach(function (timestamp) {
            delete db.key;
        });
    if (callback) callback(null);
}
