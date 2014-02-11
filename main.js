var async = require("async"),
	argv = require("optimist")
		.usage('Usage: $0 -s <search term 1> [-s <search term 2>...] -m <memory length, in minutes> [--reset] [--port <web server port to dowload csv report>]')
		.demand([ "memory", "search"])
		.alias("memory", "m")
		.alias("search", "s")
		.default("port", 8080)
		.argv;
    twitter = require("./twitter"),
    // google = require("./google"),
    inMemory = require("./in_memory");

function startSearch (err) {
    twitter.listen([ ].concat(argv.search), function (words) {
        process.stdout.write(Array(words.length + 1).join("."));
        // process.stdout.write(words.map(function (w) { return w.word; }).join(" "));
        inMemory.writeWords(words);
        // google.writeWords(words);
    });
}

function launchWebServer () {
	var express = require("express"),
		app = express(),
		path = require("path");
	app.use(express.static(path.join(__dirname, 'wwwroot')));
	app.get('/data/', function(req, res){
		inMemory.toCSV(function (err, csv) {
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Length', Buffer.byteLength(csv));
			res.end(csv);
		});
	})		;
	app.listen(parseInt(argv.port));
	console.log("The web server is listening at http://localhost" + (parseInt(argv.port) !== 80 ? ":" + argv.port : ""));
}

function launchPurging () {
	var PURGE_FREQUENCY = 5; // minutes
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
    // google.initialise, 
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
