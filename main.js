var async = require("async"),
	argv = require("optimist")
		.usage('Usage: $0 [--reset]')
		.argv;
    twitter = require("./twitter"),
    google = require("./google");

function mainLoop (err) {
    twitter.listen([ "#valentinesday"], function (words) {
        process.stdout.write(Array(words.length + 1).join("."));
        google.writeWords(words);
    });
}

async.parallel([
    twitter.initialise,
    google.initialise, 
], function (err) {
	if (argv.reset) {
		google.resetTable(mainLoop);
	} else {
		mainLoop(err);
	}
});
