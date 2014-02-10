var async = require("async"),
	argv = require("optimist")
		.usage('Usage: $0 -s <search term 1> [-s <search term 2>...] [--reset] [--port <web server port to dowload csv report>]')
		.demand([ "search"])
		.alias("search", "s")
		.default("port", 9615)
		.argv;
    twitter = require("./twitter"),
    google = require("./google"),
    inMemory = require("./in_memory");

function mainLoop (err) {
    twitter.listen([ ].concat(argv.search), function (words) {
        process.stdout.write(Array(words.length + 1).join("."));
        inMemory.writeWords(words);
        // google.writeWords(words);
    });
}

function launchWebServer () {
	var http = require('http');
	console.log("Download the CSV from http://localhost:" + argv.port);
	http.createServer(function (req, res) {
		inMemory.toCSV(function (err, csv) {
			res.writeHead(200, { 'Content-Type': 'text/csv' });
			res.end(csv);
		});
	}).listen(parseInt(argv.port));	
}

async.parallel([
    twitter.initialise,
    inMemory.initialise, 
    google.initialise, 
], function (err) {
	if (argv.reset) {
		google.resetTable(mainLoop);
	} else {
		async.parallel([
			mainLoop,
			launchWebServer
		]);
	}
});
