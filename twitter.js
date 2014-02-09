var SECRET_FILENAME = "./TWITTER_API_SECRET.json",
    SECRET_CACHE_FILENAME = "./TWITTER_OAUTH_TOKENS_CACHE.json",
    RATE_LIMIT_WINDOW = 900.,
    API_REQUESTS_TIMEOUT = 3000; // 15 minutes: Twitter's window as of 1/1/2014

var async = require('async'),
    fs = require('fs'),
    qs = require('querystring'),
    readline = require("readline"),
    request = require("request"),
    SECRET = JSON.parse(fs.readFileSync(SECRET_FILENAME)),
    oauth;

function log (s) {
    var entryDate = new Date();
    console.log("twitter.js " + entryDate.getFullYear() + "/" + (entryDate.getMonth() < 9 ? '0' : '') + (entryDate.getMonth() + 1) + "/" + (entryDate.getDate() < 10 ? '0' : '') + entryDate.getDate() + " " + (entryDate.getHours() < 10 ? '0' : '') + entryDate.getHours() + ":" + (entryDate.getMinutes() < 10 ? '0' : '') + entryDate.getMinutes() + ":" + (entryDate.getSeconds() < 10 ? '0' : '') + entryDate.getSeconds() + " - " + s);
}

exports.initialise = function (callback) {
    if (!fs.existsSync(SECRET_CACHE_FILENAME)) {
        var tempOauth = { 
                callback: 'http://www.digitalcontraptionsimaginarium.co.uk', 
                consumer_key: TWITTER_SECRET.api_key, 
                consumer_secret: TWITTER_SECRET.api_secret
            },
            url = 'https://api.twitter.com/oauth/request_token';
        request.post({url: url, oauth: tempOauth, timeout: API_REQUESTS_TIMEOUT }, function (error, response, body) {   
            var rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
            rl.question("Go to *** http://api.twitter.com/oauth/authorize?" + body + " ***, authorise the application and then paste back here the URL you are redirected to: ", function(line) {
                rl.close();
                line = line.split("?")[1];
                var perm_token = qs.parse(line); 
                oauth = { 
                    consumer_key: TWITTER_SECRET.api_key, 
                    consumer_secret: TWITTER_SECRET.api_secret, 
                    oauth_token: perm_token.oauth_token,
                    oauth_verifier: perm_token.oauth_verifier
                };
                fs.writeFileSync(SECRET_CACHE_FILENAME, JSON.stringify(oauth));
                callback(null);
            });
        });
    } else {
        oauth = JSON.parse(fs.readFileSync(SECRET_CACHE_FILENAME));
        callback(null);
    }
}

var // difficult to decide how often to run this, let's do once an hour; it is 
    // like saying that there won't be more than SEARCH_READING_DEPTH new 
    // messages to be found every hour
    SEARCH_LOOP_FREQUENCY = 3600., // seconds
    // Twitter's current max
    SEARCH_READING_DEPTH = 100, 
    // Twitter's current limit
    RATE_SEARCH_TWEETS = 450.;

var searchQueue = async.queue(function (searchString, callback) {
    var timeStart = new Date();
    request.get(
        { 
            url: "https://api.twitter.com/1.1/search/tweets.json",
            qs: { q: searchString, count: SEARCH_READING_DEPTH }, 
            oauth: oauth, 
            json: true,
            timeout: API_REQUESTS_TIMEOUT
        }, 
        function (err, response, body) {
            err = (body || { errors: null }).errors ? new Error(body.errors[0].message) : err;
            if (err) {
                log("*** ERROR: " + err);
                body = { statuses: [ ] };
            } else {
                body.statuses = body.statuses.map(function (tweet) {
                    // search result also have a 'metadata' property I am not 
                    // interested in
                    delete tweet.metadata;
                    // the trim_user parameter can't be used when searching, so I 
                    // have to do the same manually, for all tweets in the archive
                    // to be consistent
                    var temp = tweet.user;
                    delete tweet.user;
                    tweet.user = { id: temp.id, id_str: temp.id_str };
                    return tweet;
                });
            }
            var earliestNewCall = new Date(timeStart.valueOf() + RATE_LIMIT_WINDOW / RATE_SEARCH_TWEETS * 1000.),
                neededWait = Math.max(0, earliestNewCall - (new Date()));
            log("Search for \"" + searchString + "\" returned " + body.statuses.length + " tweets. Waiting " + neededWait + "ms for throttling.");
            setTimeout(function () { callback(null, body.statuses); }, neededWait);
        }
    );
}, 1);

exports.search = function (searchString, callback) {
    searchQueue.push(searchString, callback);    
}
