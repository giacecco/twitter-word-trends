var async = require("async"),
	argv = require("optimist")
		.usage('Usage: $0 -s <search term 1> [-s <search term 2>...] -m <memory length, in minutes> [-p <purge frequency, in minutes>] [--reset] [--port <web server port to dowload csv report>] [-i <interval for consolidation, in minutes>] [-l <max no. of results>] [-o]')
		.demand([ "memory", "search"])
		.alias("interval", "i")
		.alias("limit", "l")
		.alias("memory", "m")
		.alias("other", "o")
		.alias("purge", "p")
		.alias("search", "s")
		.default("port", 8080)
		.argv;
    twitter = require("./twitter"),
    inMemory = require("./in_memory");

function startSearch (err) {
    twitter.listen([ ].concat(argv.search), function (words) {
        process.stdout.write(Array(words.length + 1).join("."));
        inMemory.writeWords(words);
    });
}

function launchWebServer () {
	var express = require("express"),
		app = express(),
		path = require("path");
	app.use(express.static(path.join(__dirname, 'wwwroot')));
	app.get('/data/', function(req, res){
		inMemory.toCSV({ 
			interval: argv.interval ? parseInt(argv.interval) : null,
			limit: argv.limit ? parseInt(argv.limit) : null, 
			other: argv.other
		}, function (err, csv) {
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Length', Buffer.byteLength(csv));
			res.end(csv);
		});
	})		;
	app.listen(parseInt(argv.port));
	console.log("The web server is listening at http://localhost" + (parseInt(argv.port) !== 80 ? ":" + argv.port : ""));
}

function launchPurging () {
	var PURGE_FREQUENCY = argv.purge ? parseInt(argv.purge) : 5; // minutes
	function purge () {
		var now = new Date(),
			earliestDateToKeep = new Date((new Date()) - parseInt(argv.memory) * 60000);
		console.log("\nPurging memory before " + earliestDateToKeep + ".");
		inMemory.purge(earliestDateToKeep, function (err) {
			setTimeout(purge, PURGE_FREQUENCY * 60000 - ((new Date()) - now));
		})
	}
	setTimeout(purge, PURGE_FREQUENCY * 60000);
}

async.parallel([
	// all initialisation *independent* of command line parameters
    twitter.initialise,
    inMemory.initialise, 
], function (err) {
	if (argv.reset) {
		// all initialisation *dependent* of command line parameters
		google.resetTable(mainLoop);
	} else {
		// all operations
		async.parallel([
			startSearch,
			launchPurging,
			launchWebServer
		]);
	}
});
