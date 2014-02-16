var csv = require("csv"),
	fs = require("fs"),
    util = require("./util"),
	db = { };

exports.initialise = function (options, callback) {
	if (fs.existsSync(options.filename)) db = JSON.parse(fs.readFileSync(options.filename));
	callback(null);
}

exports.writeWords = function (words, callback) {
	words.forEach(function (word) {
		if (!db[word.created_at]) db[word.created_at] = { }
		db[word.created_at][word.word] = (db[word.created_at][word.word] || 0) + 1;
	});
	if (callback) callback(null);
}

exports.toCSV = function (options, callback) {
	var // TODO: is there a better way to clone an object?
		consolidatedDb = JSON.parse(JSON.stringify(db)),
		totals,
		allWords;
	if (options.interval) {
		consolidatedDb = { };
		var allTimestamps = Object.keys(db).map(function (t) { return new Date(t); }),
			earliestTimestamp = Math.min.apply(null, allTimestamps),
			latestTimestamp = Math.max.apply(null, allTimestamps);
		earliestTimestamp = new Date(Math.floor(earliestTimestamp.valueOf() / options.interval / 60000) * options.interval * 60000);
		latestTimestamp = new Date(Math.floor(latestTimestamp.valueOf() / options.interval / 60000) * options.interval * 60000);
		for (var d = earliestTimestamp; d < latestTimestamp; d = new Date(d.valueOf() + options.interval * 60000)) {
			var timestampFrom = util.date2Timestamp(d),
				timestampTo = util.date2Timestamp(new Date(d.valueOf() + options.interval * 60000));
			consolidatedDb[timestampFrom] = Object.keys(db)
				.filter(function (timestamp) {
					return (timestamp >= timestampFrom) && (timestamp < timestampTo);
				})
				.reduce(function (memo, timestamp) {
					Object.keys(db[timestamp]).forEach(function (word) {
						memo[word] = (memo[word] ? memo[word] : 0) + db[timestamp][word];
					});
					return memo;
				}, { });
		}
	}
	if (options.limit) {
		// I want a report of the top options.limit words, possibly including
		// a 'others' category
		totals = { };
		Object.keys(consolidatedDb).forEach(function (timestamp) {
			Object.keys(consolidatedDb[timestamp]).forEach(function (word) {
				totals[word] = (totals[word] || 0) + consolidatedDb[timestamp][word];
			});
		});
		totals = Object.keys(totals).map(function (word) {
			return { word: word, total: totals[word] };
		}).sort(function (a, b) { return b.total - a.total; }).slice(0, options.limit - (options.other ? 1 : 0));
		allWords = totals.map(function (t) { return t.word; });
		if (options.other) {
			// Using "other" is ok as it is a stopword in English
			allWords = allWords.concat("other");
			Object.keys(consolidatedDb).forEach(function (timestamp) {
				consolidatedDb[timestamp]["other"] = Object.keys(consolidatedDb[timestamp])
					.filter(function (word) { return allWords.indexOf(word) === -1; })
					.reduce(function (memo, word) {
						return memo + consolidatedDb[timestamp][word];
					}, 0);
			});
		}
	} else {
		// I want a full report
		allWords = Object.keys(consolidatedDb).reduce(function (memo, timestamp) {
			return Object.keys(consolidatedDb[timestamp]).reduce(function (memo2, word) {
				return memo2.indexOf(word) === -1 ? memo2.concat(word) : memo2;
			}, memo);
		}, [ ]).sort();
	}
	csv()
		// TODO: odd here, if I explicitly sort the array in .from.array, it
		// actually gets un-sorted!!!
		.from.array(Object.keys(consolidatedDb).map(function (timestamp) {
			var temp = JSON.parse(JSON.stringify(consolidatedDb[timestamp]));
			temp.timestamp = timestamp;
			return temp;
		}))
		.to.string(function (data, count) {
			callback(null, data);
		}, {
			header: true, 
			// TODO: what if "timestamp" is a trending word?
			columns: [ "timestamp" ].concat(allWords)
		});
}

exports.purge = function (options, callback) {
	var earliestTimestampToKeep = util.date2Timestamp(options.earliestDateToKeep);
    Object.keys(db)
        .filter(function (key) { return key < earliestTimestampToKeep; })
        .forEach(function (timestamp) {
            delete db.key;
        });
    if (options.filename) {
	    fs.writeFile(options.filename, JSON.stringify(db), function (err) {
	    	if (callback) callback(err);
	    }); 
	} else {
	    if (callback) callback(null);
    }
}
