var Instructions = React.createClass({
  render: function() {
    return(
      // Yes, I ripped this off of Khan Academy's site
      <div>
        <h2 className="white-heading-text">Hello Khan Academy</h2>
        <div id="challenge-task-container" className="objectives-pane-outer">
          <div id="objectives-pane" className="min-contained-and-centered"><h2>{this.props.title}</h2>
            <div className="challenge-step">
              <div className="test-structure">
                <h3>Hint
                </h3>
                <div className="test-challenge-wrap">
                </div>
              </div>
              <div className="test-description">
              <p>{this.props.hint}</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }
});

var Tests = React.createClass({
  validTerms: ["Node", "Identifier", "Literal", "RegExpLiteral", "Program", "Function", "Statement",
    "ExpressionStatement", "BlockStatement", "EmptyStatement", "DebuggerStatement", "WithStatement",
    "ReturnStatement", "LabeledStatement", "BreakStatement", "ContinueStatement", "IfStatement",
    "SwitchStatement", "SwitchCase", "ThrowStatement", "TryStatement", "CatchClause", "WhileStatement",
    "DoWhileStatement", "ForStatement", "ForInStatement", "Declaration", "FunctionDeclaration",
    "VariableDeclaration", "VariableDeclarator", "Expression", "ThisExpression", "ArrayExpression",
    "ObjectExpression", "Property", "FunctionExpression", "UnaryExpression", "UnaryOperator", "UpdateExpression",
    "UpdateOperator", "BinaryExpression", "BinaryOperator", "AssignmentExpression", "AssignmentOperator", "LogicalExpression",
    "LogicalOperator", "MemberExpression", "ConditionalExpression", "CallExpression", "NewExpression",
    "SequenceExpression", "Pattern"],
  options: function() {
    return this.validTerms.map(function(term) { return {label: term, value: term}}); // arrow function gives error here.
  },
  getInitialState: function() {
    return {
      "whitelist": "",
      "blacklist": "",
      "whitelistResults": "",
      "blacklistResults": ""
    };
  },
  submitCode: function(fn) {
    // var code = this.props.code;
    // var whitelist = this.state[fn];
    // console.log(fn + " " + whitelist);
    $.ajax({
      url: "/analyze/" + fn,
      type: "POST",
      dataType: 'json',
      data: {
        "code": this.props.code,
        [fn]: this.state[fn]
      },
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({
          [fn + "Results"]: data.response
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({
          [fn + "Results"]: err.toString()
        });
        console.error("/analyze", status, err.toString());
      }.bind(this),
    });
  },
  handleInput: function(inputField, value) {
    this.setState({
      [inputField]: value
    });
  },
  render: function() {
    return(
      <div className="float-left horiz-space-2">
        <p>Here you can test the new API. Available terms for whitelist and blacklist can be found <a href="https://github.com/estree/estree/blob/master/spec.md">here</a>.</p>
        <ul>
          <li>
            <label>Whitelist (, separated)</label>
            <Select
                name="whitelist-select"
                value={this.state.whitelist}
                options={this.options()}
                onChange={this.handleInput.bind(this, "whitelist")}
                multi
                simpleValue
                clearable={false}
            />
            <div className="test-results">{this.state.whitelistResults}</div>
            <button onClick={() => this.submitCode("whitelist")}>Check Code</button>
          </li>

          <li>
            <label>Blacklist (, separated)</label>
            <Select
                name="blacklist-select"
                value={this.state.blacklist}
                options={this.options()}
                onChange={this.handleInput.bind(this, "blacklist")}
                multi
                simpleValue
                clearable={false}
            />
            <div className="test-results">{this.state.blacklistResults}</div>
            <button onClick={() => this.submitCode("blacklist")}>Check Code</button>
          </li>
        </ul>
      </div>
      );
  }
});

var CodeEditor = React.createClass({
  getInitialState: function() {
    return {code: ""};
  },
  componentDidMount: function() {
    var editor = ace.edit("editor");
    // editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
    this.setState({"editor": editor});
  },
  handleInput: function() {
    this.setState({"code": this.state.editor.getValue()});
  },
  render: function() {
    return(
      <div>
        <div className="float-left" id="editor" onInput={this.handleInput}></div>
        <Tests code={this.state.code}/>
      </div>
    );
  }
});

var AppContainer = React.createClass({
  render: function() {
    return(
      <div>
        <Instructions title="Challenge API Test Page" hint="Write some javascript, then use the side panel to run tests on it."/>
        <CodeEditor />
      </div>
    );
  }
});

ReactDOM.render(
  <AppContainer/>,
  document.getElementById('content')
);
