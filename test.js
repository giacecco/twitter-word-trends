var async = require("async"),
    twitter = require("./twitter"),
    google = require("./google");

async.series([
    twitter.initialise,
    google.initialise
], function (err) {
    twitter.search("#valentinesday", function (err, statuses) {
        console.log(statuses[0]);
    });
    /*
    google.writeTweet(function (err) {
        console.log("Finshed");
    });
    */
})

