var SECRET_FILENAME = "./GOOGLE_API_SECRET.json",
    SECRET_CACHE_FILENAME = "./GOOGLE_OAUTH_TOKENS_CACHE.json",
    CONFIG_FILENAME = "./GOOGLE_CONFIG.json";

var fs = require('fs'),
    qs = require('querystring'),
    readline = require("readline"),
    googleapis = require('googleapis'),
    OAuth2 = googleapis.auth.OAuth2,
    GOOGLE_SECRET = JSON.parse(fs.readFileSync(SECRET_FILENAME)).installed,
    oauth2Client = new OAuth2(GOOGLE_SECRET.client_id, GOOGLE_SECRET.client_secret, "http://www.digitalcontraptionsimaginarium.co.uk/"),
    CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILENAME)),
    client;

exports.initialise = function (callback) {
    googleapis
        .discover('bigquery', 'v2')
        .execute(function(err, tempClient) {
            client = tempClient;
            if (!fs.existsSync(SECRET_CACHE_FILENAME)) {
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
                        fs.writeFileSync(SECRET_CACHE_FILENAME, JSON.stringify(tokens));
                        oauth2Client.setCredentials(tokens);
                        callback(null);
                    });
                });
            } else {
                oauth2Client.setCredentials(JSON.parse(fs.readFileSync(SECRET_CACHE_FILENAME)));
                callback(null);
            }
        });
}

exports.writeWords = function (words, callback) {
    client
        .bigquery.tabledata.insertAll({
            projectId: CONFIG.project_id,
            datasetId: CONFIG.dataset_id,
            tableId: CONFIG.table_id
        }, {
            kind: "bigquery#tableDataInsertAllRequest",
            rows: words.map(function (word) { return { json: { created_at: word.created_at, word: word.word } }; })
        })
        .withAuthClient(oauth2Client)
        .execute(function (err, response) {
            if (err) console.log(err);
            if (callback) callback(null);
        });
}

exports.resetTable = function (callback) {
    callback = callback || function (err) { };
    exports.deleteTable(function (err) {
        if (err) {
            callback(err);
        } else {
            exports.createTable(callback);           
        }
    });
}

exports.createTable = function (callback) {
    client
        .bigquery.tables.insert({
            projectId: CONFIG.project_id,
            datasetId: CONFIG.dataset_id,
        }, {
            "kind": "bigquery#table",
            "schema": {
                "fields": [
                    {
                        "name": "created_at",
                        "type": "TIMESTAMP"
                    },
                    {
                        "name": "word",
                        "type": "STRING"
                    }
                ]
            },
            "tableReference": {
                "projectId": CONFIG.project_id,
                "datasetId": CONFIG.dataset_id,
                "tableId": CONFIG.table_id
            }
        })
        .withAuthClient(oauth2Client)
        .execute(function (err, response) {
            if (callback) callback(null);
        });    
}

exports.deleteTable = function (callback) {
    client
        .bigquery.tables.delete({
            projectId: CONFIG.project_id,
            datasetId: CONFIG.dataset_id,
            tableId: CONFIG.table_id
        })
        .withAuthClient(oauth2Client)
        .execute(function (err, response) {
            if (callback) callback(null);
        });    
}
