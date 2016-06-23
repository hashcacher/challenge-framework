var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var esprima = require("esprima");

app.set("port", process.env.PORT || 3000);

app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Disable caching so we"ll always get the latest comments.
    res.setHeader("Cache-Control", "no-cache");
    next();
});

app.post("/analyze/whitelist", function(req, res) {
    var code = req.body.code;
    var whitelistString = req.body.whitelist;
	var inputValid = validList(whitelistString);

	if(inputValid === "OK")
    {
    	try
    	{
    		var AST = esprima.parse(code, {loc: true});
	    	// See if the code is valid
		    var result = analyzeList(AST,whitelistString, "whitelist");
			if(result.length > 0)
			{
				res.json({"response": "Missing code: " + result.join(", ")});
			}
			else
			{
				res.json({"response": "All good :-)"});
			}
		}
		catch(error)
		{
			res.json({"response": "Something's wrong with your code: " + error.description + ":" + error.lineNumber});
			// res.json({"response": "Something's wrong with your code: " + error.split("\n")[0]});
		}
	}
	else
	{
		res.json({"response": inputValid});
	}
});


// This could have been coalesced with the whitelist handler...
app.post("/analyze/blacklist", function(req, res) {
    var code = req.body.code;
    var blacklistString = req.body.blacklist;

    var inputValid = validList(blacklistString);

    if(inputValid === "OK")
    {
    	try
    	{
    		var AST = esprima.parse(code, {loc: true});
	    	// See if the code is valid
		    var result = analyzeList(AST, blacklistString, "blacklist");
			if(result.length > 0)
			{
				res.json({"response": "Blackisted code found: " + result.join(", ")});
			}
			else
			{
				res.json({"response": "All good :-)"});
			}
		}
		catch(error)
		{
			res.json({"response": "Something's wrong with your code: " + error.description + ":" + error.lineNumber});
		}
	}
	else
	{
		res.json({"response": inputValid});
	}
});

function validList(listString) {
	var nodesToFind = csvToList(listString);
    var validation = isValidNodeList(nodesToFind);
    if(validation === false)
    {
    	return "Invalid list.";
    }
    else if(Array.isArray(validation) && validation.length > 0)
    {
    	return "You entered some invalid terms: " + validation.join(", ")
    		+ ". Please make sure all terms are valid.";
    }
    else
    {
    	return "OK";
    }
}

function csvToList(string) {
	var trimmed = string.trim();
	if(trimmed === "")
		return null;
	var parts = string.trim().split(",");
	return parts.map(stringPart => stringPart.trim());
}

function isValidNodeList(nodelist) {
	const validNodes = ["Node", "Identifier", "Literal", "RegExpLiteral", "Program", "Function", "Statement", "ExpressionStatement", "BlockStatement", "EmptyStatement",
	"DebuggerStatement", "WithStatement", "ReturnStatement", "LabeledStatement", "BreakStatement", "ContinueStatement", "IfStatement", "SwitchStatement", "SwitchCase",
	"ThrowStatement", "TryStatement", "CatchClause", "WhileStatement", "DoWhileStatement", "ForStatement", "ForInStatement", "Declaration", "FunctionDeclaration",
	"VariableDeclaration", "VariableDeclarator", "Expression", "ThisExpression", "ArrayExpression", "ObjectExpression", "Property", "FunctionExpression", "UnaryExpression",
	"UnaryOperator", "UpdateExpression", "UpdateOperator", "BinaryExpression", "BinaryOperator", "AssignmentExpression", "AssignmentOperator", "LogicalExpression",
	"LogicalOperator", "MemberExpression", "ConditionalExpression", "CallExpression", "NewExpression", "SequenceExpression", "Pattern"];

	if(!Array.isArray(nodelist))
		return false;
	badNodes = [];
	nodelist.forEach(function(node) {
		if(validNodes.indexOf(node) == -1)
			badNodes.push(node)
	});
	return badNodes;
}

// returns an object with keys = to nodes and bool values indicating existence
function nodesExistInCode(code, list) {
	// Dictionary for fast lookup
	var existenceDictionary = {};
	list.forEach(function(item) {
		existenceDictionary[item] = false;
	});

	//DFS
	var list = code.body;

	while(list.length > 0)
	{
		var node = list[0];
		//Check for nodes
		if(node.type in existenceDictionary)
		{
			existenceDictionary[node.type] = node.loc.start.line;
		}

		//Check for other nodes inside
		Object.keys(node).forEach(function(key) {
			if(node[key] && typeof(node[key]) == "object")
				list.push(node[key]);
		}); //lists?

		//Remove the first item
		list.shift();
	}
	return existenceDictionary;
}

function analyzeList(code, listString, type)
{
	var nodesToFind = csvToList(listString);
	var existence = nodesExistInCode(code, nodesToFind);

	var accumulator = [];
	// Any nodes that weren't found will be false in the dictionary obj
	Object.keys(existence).forEach(function(key) {
		if(existence[key] === false && type == "whitelist" || existence[key] != false && type == "blacklist")
		{
			var stringToPut = key;
			if(type == "blacklist")
				stringToPut += ":"+existence[key];
			accumulator.push(stringToPut);
		}
	});
	return accumulator;
}

app.listen(app.get("port"), function() {
  console.log("Server started: http://localhost:" + app.get("port") + "/");
});
