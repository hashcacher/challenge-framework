var path = require("path");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var esprima = require("esprima");

app.set("port", process.env.PORT || 3001);

app.get("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache");
    next();
});

app.post("/analyze/whitelist", function(req, res) {
    var code = req.body.code;
    var whitelistString = req.body.whitelist;
    var inputValid = validListString(whitelistString);

    if(inputValid === "OK")
    {
        var AST = null;
        try
        {
            AST = esprima.parse(code, {loc: true});
        }
        catch(error)
        {
            res.json({"response": "Syntax error in your code: " + error.description + ":" + error.lineNumber});
            return;
        }
        if(AST)
        {
            // Analyze the code via the list
            var result = analyzeList(AST,whitelistString, "whitelist");
            if(result.length > 0) res.json({"response": "Missing code: " + result.join(", ")});
            else res.json({"response": "All good :-)"});
        }
    }
    else res.json({"response": inputValid});
});


// This could have been coalesced with the whitelist handler...
app.post("/analyze/blacklist", function(req, res) {
    var code = req.body.code;
    var blacklistString = req.body.blacklist;
    var inputValid = validListString(blacklistString);

    if(inputValid === "OK")
    {
        var AST = null;
        try
        {
            AST = esprima.parse(code, {loc: true});
        }
        catch(error)
        {
            res.json({"response": "Syntax error in your code: " + error.description + ":" + error.lineNumber});
        }
        if(AST)
        {
            // Analyze the code via the list
            var result = analyzeList(AST, blacklistString, "blacklist");
            if(result.length > 0) res.json({"response": "Blackisted code found: " + result.join(", ")});
            else res.json({"response": "All good :-)"});
        }
    }
    else res.json({"response": inputValid});
});

app.post("/analyze/structure", function(req, res) {
    var code = req.body.code;
    var structureString = req.body.structure;
    var inputValid = validStructure(structureString);
    if(inputValid === "OK")
    {
        var AST = null;
        try
        {
            AST = esprima.parse(code, {loc: true});
        }
        catch(error)
        {
            res.json({"response": "Something's wrong with your code: " + error.description + ":" + error.lineNumber});
            return;
        }

        if(AST)
        {
            // See if the code is valid
            var result = analyzeStructure(AST, structureString);
            if(result.length > 0) res.json({"response": "Structure not found : " + result.join(", ")});
            else res.json({"response": "All good :-)"});
        }
    }
    else res.json({"response": inputValid});
});

/**
*   Returns OK or parts of structureString that are invalid
*/
function validStructure(structureString) {
    var invalidTokens = [];
    var tokens = structureString.split("->");
    
    if(tokens.length < 2) return "Use a ->";
    else if(tokens.length > 2) return "Too many ->s";

    tokens.forEach(function(token) 
    {
        var nodes = token.split(",");
        nodes.forEach(function(node)
        {
            if(validNodes.indexOf(node.trim()) === -1)
            {
                invalidTokens.push(node.trim());
            }
        });
    });

    if(invalidTokens.length === 0) return "OK";
    else return "Invalid nodes: " + invalidTokens.join(", ") + ".";
}

/**
*   Returns OK or parts of listString that are invalid
*/
function validListString(listString) {
    var nodesToFind = csvToList(listString);
    var invalidNodeList = invalidNodes(nodesToFind);
    if(invalidNodeList === false) return "Invalid list.";
    else if(Array.isArray(invalidNodeList) && invalidNodeList.length > 0)
    {
        return "You entered some invalid terms: " + invalidNodeList.join(", ") + 
            ". Please make sure all terms are valid.";
    }
    else return "OK";
}

function invalidNodes(nodelist) {
    
    if(!Array.isArray(nodelist)) return false;
    badNodes = [];
    nodelist.forEach(function(node) {
        if(validNodes.indexOf(node) === -1) badNodes.push(node);
    });
    return badNodes;
}

function csvToList(string) {
    var trimmed = string.trim();
    if(trimmed === "") return null;
    var parts = string.trim().split(",");
    return parts.map(stringPart => stringPart.trim());
}

const validNodes = ["Node", "Identifier", "Literal", "RegExpLiteral", "Program", "Function", "Statement", "ExpressionStatement", "BlockStatement", "EmptyStatement",
    "DebuggerStatement", "WithStatement", "ReturnStatement", "LabeledStatement", "BreakStatement", "ContinueStatement", "IfStatement", "SwitchStatement", "SwitchCase",
    "ThrowStatement", "TryStatement", "CatchClause", "WhileStatement", "DoWhileStatement", "ForStatement", "ForInStatement", "Declaration", "FunctionDeclaration",
    "VariableDeclaration", "VariableDeclarator", "Expression", "ThisExpression", "ArrayExpression", "ObjectExpression", "Property", "FunctionExpression", "UnaryExpression",
    "UnaryOperator", "UpdateExpression", "UpdateOperator", "BinaryExpression", "BinaryOperator", "AssignmentExpression", "AssignmentOperator", "LogicalExpression",
    "LogicalOperator", "MemberExpression", "ConditionalExpression", "CallExpression", "NewExpression", "SequenceExpression", "Pattern"];

/**
*   Returns an object with keys = to nodes and bool values indicating existence
*/
function nodesExistInCode(code, list) {
    // Dictionary for fast lookup
    var existenceDictionary = {};
    list.forEach(function(item) {
        existenceDictionary[item] = false;
    });

    //BFS
    var queue = code.body;
    while(queue.length > 0)
    {
        var node = queue[0];

        // We're not validating each item in arrays, just concatting, so we validate here.
        if(!node)
        {
            queue.shift();
            continue;
        }

        //Check for nodes
        if(node.type in existenceDictionary) existenceDictionary[node.type] = node.loc.start.line;

        //Check for other nodes inside
        Object.keys(node).forEach(function(key) {
            if(Array.isArray(node[key])) //leads to infinite loop
                queue = queue.concat(node[key]);
            else if(node[key] && typeof node[key] === "object")
                queue.push(node[key]);
        });

        //Remove the first item
        queue.shift();
    }
    return existenceDictionary;
}

/**
*   Returns an array of nodes that violate the specified type of list analysis [whitelist or blacklist]
*/
function analyzeList(code, listString, type)
{
    var nodesToFind = csvToList(listString);
    var existence = nodesExistInCode(code, nodesToFind);

    var accumulator = [];
    // Any nodes that weren't found will be false in the dictionary obj
    Object.keys(existence).forEach(function(key) {
        if(existence[key] === false && type === "whitelist" || existence[key] !== false && type === "blacklist")
        {
            var stringToPut = key;
            if(type == "blacklist") stringToPut += ":" + existence[key];
            accumulator.push(stringToPut);
        }
    });
    return accumulator;
}

/**
* Checks if nodes are inside of other nodes.
* First finds all instances of the parent node
* Then checks each one of the parent nodes for the child nodes.
* If multiple children are specified, they must all be inside the same parent.
* Returns either the parent node, children nodes or an empty list if structure was found.
*/
function analyzeStructure(code, structureString)
{
    var parentAndChildren = structureString.split("->");
    var parent = parentAndChildren[0].trim();
    var children = csvToList(parentAndChildren[1]);

    //BFS - find parent nodes - 
    var parentInstances = [];
    var queue = code.body;
    while(queue.length > 0)
    {
        var node = queue[0];
        
        if(!node)
        {
            queue.shift();
            continue;
        }

        //Check for nodes
        if(node.type === parent) parentInstances.push(node);

        //Check for other nodes inside
        Object.keys(node).forEach(function(key) 
        {
            if(Array.isArray(node[key])) queue = queue.concat(node[key]);
            else if(node[key] && typeof node[key] === "object") queue.push(node[key]);
        });

        //Remove the first item
        queue.shift();
    }

    if(parentInstances.length === 0) return [parent];

    //Find children inside of the parents.
    var foundAll = false;
    parentInstances.forEach(function(node) {
        var childrenLeftToFind = children.slice(0);
        Object.keys(node).forEach(function(key) 
        {
            if(node[key] && typeof node[key] == "object" && !Array.isArray(node[key]))
            {
                var index = childrenLeftToFind.indexOf(node[key].type);
                if(index != -1) childrenLeftToFind.splice(index, 1);
            }
            else if(Array.isArray(node[key]))
            {
                node[key].forEach(function(childNode) 
                {
                    if(childNode && typeof(childNode) == "object" && !Array.isArray(childNode))
                    {
                        var index = childrenLeftToFind.indexOf(childNode.type);
                        if(index != -1) childrenLeftToFind.splice(index, 1);
                    }
                });
            }
        });
        if(childrenLeftToFind.length === 0)
        {
            foundAll = true;
            return;
        }
    });

    return foundAll ? [] : children;

}

app.listen(app.get("port"), function() {
  console.log("Server started: http://localhost:" + app.get("port") + "/");
});
