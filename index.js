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

app.post('/analyze/whitelist', function(req, res) {
    var code = req.body.code;
    var whitelist = req.body.whitelist;
    var response = analyzeWhitelist(code, whitelist);
    console.log("res: " + response);
    res.json({"response": response});
});

function analyzeWhitelist(code, whitelist) {
	// Whitelist dictionary for fast lookup
	var whitelistObj = {};
	whilelist.forEach(function(item) {
		whitelistObj[item] = false;
	});

	console.log("code:" + code);
	console.log("whitelist:" + whitelist);
	var syntax = esprima.parse(code);



	//DFS
	var list = syntax["body"]
	while(list.length > 0)
	{
		var block = list[0];

		//Check for whitelist
		if(block.type in whitelistObj)
		{
			whitelistObj[block.type] = true;
		}

		//Check for other blocks inside
		if("body" in block)
		{
			list.push(block.body)
		}

		//Remove the first item
		list.shift(); 
	}
	
	leftover = []
	Object.keys(whitelistObj).forEach(function(key) {
		if(whitelistObj[key] == false)
			leftover.push(key);
	});
}

function analyzeCode(code) {
	var syntax = esprima.parse(code);
	// console.log()
}

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
