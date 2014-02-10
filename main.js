var async = require("async"),
	argv = require("optimist")
		.usage('Usage: $0 [--reset]')
		.argv;
    twitter = require("./twitter"),
    google = require("./google"),
    inMemory = require("./in_memory");

function mainLoop (err) {
    twitter.listen([ "#valentinesday"], function (words) {
        process.stdout.write(Array(words.length + 1).join("."));
        inMemory.writeWords(words);
        // google.writeWords(words);
    });
}

function launchWebServer () {
	var http = require('http');
	http.createServer(function (req, res) {
		inMemory.toCSV(function (err, csv) {
			res.writeHead(200, { 'Content-Type': 'text/csv' });
			res.end(csv);
		});
	}).listen(9615);	
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
