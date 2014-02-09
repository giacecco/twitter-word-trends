var fs = require('fs'),
    qs = require('querystring'),
    readline = require("readline"),
    googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2,
    GOOGLE_SECRET = JSON.parse(fs.readFileSync("./GOOGLE_API_SECRET.json")).installed,
    oauth2Client = new OAuth2(GOOGLE_SECRET.client_id, GOOGLE_SECRET.client_secret, "http://localhost");

function initialiseGoogleApis (callback) {
    googleapis
        .discover('bigquery', 'v2')
        .execute(function(err, client) {
            if (!fs.existsSync("./GOOGLE_OAUTH_TOKENS_CACHE.json")) {
                var rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    }), 
                    url = oauth2Client.generateAuthUrl({
                        access_type: 'offline',
                        scope: 'https://www.googleapis.com/auth/bigquery'
                    });
                rl.question("Go to *** " + url + " ***, authorise the application and then paste back here the URL you are redirected to: ", function(line) {
                    rl.close();
                    var code = qs.parse(line.split("?")[1]).code;
                    oauth2Client.getToken(code, function(err, tokens) {
                        fs.writeFileSync("./GOOGLE_OAUTH_TOKENS_CACHE.json", JSON.stringify(tokens));
                        oauth2Client.setCredentials(tokens);
                        callback(null, client);
                    });
                });
            } else {
                oauth2Client.setCredentials(JSON.parse(fs.readFileSync("./GOOGLE_OAUTH_TOKENS_CACHE.json")));
                callback(null, client);
            }
        });
}

initialiseGoogleApis(function (err, googleApiClient) {

    function repeat () {
        var access_token_before = oauth2Client.credentials.access_Token;
        googleApiClient
            .bigquery.datasets.list({
                projectId: "pro-kayak-479"
            })
            .withAuthClient(oauth2Client)
            .execute(function (err, response) {
                if (oauth2Client.credentials.access_Token != access_token_before) {
                    console.log("***** oauth2Client.credentials.access_Token has changed");
                    fs.writeFileSync("./GOOGLE_OAUTH_TOKENS_CACHE.json", JSON.stringify(oauth2Client.credentials));
                }
                console.log("response is " + JSON.stringify(response));
                setTimeout(repeat, 5000);
            });
    }
    repeat()

});