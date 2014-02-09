var async = require("async"),
    twitter = require("./twitter"),
    google = require("./google");

async.series([
    twitter.initialise,
    google.initialise
], function (err) {
    twitter.listen([ "#valentinesday"], function (words) {
        process.stdout.write(Array(words.length + 1).join("."));
        google.writeWords(words);
    });
})

