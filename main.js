var async = require("async"),
	argv = require("optimist")
		.usage('Usage: $0 -s <search term 1> [-s <search term 2>...] [--reset] [--port <web server port to dowload csv report>]')
		.demand([ "search"])
		.alias("search", "s")
		.default("port", 8080)
		.argv;
    twitter = require("./twitter"),
    google = require("./google"),
    inMemory = require("./in_memory");

function startSearch (err) {
    twitter.listen([ ].concat(argv.search), function (words) {
        // process.stdout.write(Array(words.length + 1).join("."));
        process.stdout.write(words.map(function (w) { return w.word; }).join(" "));
        inMemory.writeWords(words);
        // google.writeWords(words);
    });
}

function launchWebServer () {
	var express = require("express"),
		app = express(),
		path = require("path");
	app.set('port', parseInt(argv.port));
	app.use(express.static(path.join(__dirname, 'wwwroot')));
	app.get('/data/', function(req, res){
		inMemory.toCSV(function (err, csv) {
			res.setHeader('Content-Type', 'text/csv');
			res.setHeader('Content-Length', Buffer.byteLength(csv));
			res.end(csv);
		});
	})		;
	app.listen();
	console.log("The web server is listening at http://localhost" + (app.get('port') !== 80 ? ":" + argv.port : ""));
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
			startSearch,
			launchWebServer
		]);
	}
});
