var async = require("async"),
	argv = require("optimist")
		.usage('Usage: $0 -s <search term 1> [-s <search term 2>...] -m <memory length, in minutes> -w <web server static root folder> [-f <database dump filename>] [-p <purge frequency, in minutes>] [--reset] [--port <web server port to dowload csv report>] [-i <interval for consolidation, in minutes>] [-l <max no. of results>] [-o]')
		.demand([ "memory", "search"])
		.alias("interval", "i")
		.alias("filename", "f")
		.alias("limit", "l")
		.alias("memory", "m")
		.alias("other", "o")
		.alias("purge", "p")
		.alias("search", "s")
		.alias("wwwroot", "w")
		.default("port", 8080)
		.argv;
    twitter = require("./twitter"),
    inMemory = require("./in_memory");

function startSearch (err) {
    twitter.listen({ searchStrings: [ ].concat(argv.search) }, function (words) {
        process.stdout.write(Array(words.length + 1).join("."));
        inMemory.writeWords(words);
    });
}

function launchWebServer () {
	var express = require("express"),
		app = express(),
		path = require("path");
	app.use(express.static(argv.wwwroot));
	app.get('/data/', function(req, res){
		inMemory.toCSV({ 
			interval: req.query.interval || argv.interval ? parseInt(req.query.interval || argv.interval) : null,
			limit: req.query.limit || argv.limit ? parseInt(req.query.limit || argv.limit) : null, 
			other: ((typeof(req.query.other) === "string") ? req.query.other !== "false" : false) || argv.other
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
		inMemory.purge({ 
				filename: argv.filename, 
				earliestDateToKeep: earliestDateToKeep 
			}, function (err) {
				setTimeout(purge, PURGE_FREQUENCY * 60000 - ((new Date()) - now));
			});
	}
	setTimeout(purge, PURGE_FREQUENCY * 60000);
}

async.parallel([
	// all initialisation *independent* of command line parameters
    twitter.initialise,
    function (callback) {
    	inMemory.initialise({ filename: argv.filename }, callback);
    } 
], function (err) {
	// all operations
	async.parallel([
		startSearch,
		launchPurging,
		launchWebServer
	]);
});
