var express = require('express');
var app = express();
var fs = require("fs");
var settingsStr = fs.readFileSync("settings.json").toString()
var jsonminify = require("jsonminify");
var settings = JSON.parse(jsonminify(settingsStr));
var path = require('path');
var router = express.Router()
var bodyParser = require("body-parser");
var ejs = require("ejs");
request = require('request');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.engine("html", ejs.renderFile);
app.set('port', process.env.PORT || settings.port);
app.use("/public",express.static(__dirname + "/public"));
app.use("/assets",express.static(__dirname + "/assets"));
app.get('/', function(req, res) {
    res.render(__dirname + "/public/index.html", {
        data: "",
        settings: JSON.stringify(settings),
    });
});

router.get("/", function(req, res) {
    res.json({message: "hooray! welcome to our api!"});
});
router.get("/getmasternodes", function(req, res) {
   request({uri: 'https://explorer.win.win/ext/getpeersmap', json: true}, function (error, response, body) {
	  // request({uri: 'https://win.win/static.json', json: true}, function (error, response, body) {
        if (response && response.statusCode == 200) {
            // console.log("response",response.statusCode);
            createNodesFile(body);
            res.json({data: body});
        } else {
            fs.exists('nodes.json', function(exists){
                if(exists){
                    fs.readFile('nodes.json', function readFileCallback(err, data) {
                        res.json({data: JSON.parse(data)});
                    })
                }
            })
        }
    });
});

var createNodesFile = function(json) {
    var obj = {
        table: []
    };
    fs.exists('nodes.json', function(exists){
        if(exists){
            // console.log("yes file exists");
            fs.readFile('nodes.json', function readFileCallback(err, data) {
                fs.writeFile('nodes.json', JSON.stringify(json), function(error) {

                });
            })
        } else {
            // console.log("file not exists")
            fs.writeFile('nodes.json', JSON.stringify(json), function(error) {

            });
        }
    });
}
var addToHeader = function (req, res, next) {
    // console.log("add to header called ... " + req.url);
    // res.header("charset", "utf-8")
    var allowedOrigins = [];
    var origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    if(allowedOrigins.indexOf(origin) > -1){
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Content-Type", "application/json");
    next();
};
app.use("/api", addToHeader, router);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});