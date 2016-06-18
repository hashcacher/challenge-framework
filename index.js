var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var esprima = require('esprima')

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.post('/analyze', function(req, res) {
    console.log("body: " + Object.keys(req.body));
    var code = req.body.code;
    console.log("req: " + code);
    var response = analyzeCode(code);
    console.log("res: " + response);
    res.json({"response": response});
});

function analyzeCode(code) {
	return esprima.parse(code);
}


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
