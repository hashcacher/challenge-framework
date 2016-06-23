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
      "structure": "",
      "whitelistResults": "",
      "blacklistResults": "",
      "structureResults": ""
    };
  },
  submitCode: function(fn) {
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
        this.setState({
          [fn + "Results"]: data.response
        });
      }.bind(this),
      error: function(xhr, status, err) {
        if(err == "")
        {
          this.setState({
            [fn + "Results"]: "Server offline."
          });
        }
        else
        {
          this.setState({
            [fn + "Results"]: err.toString()
          });
        }
      }.bind(this),
    });
  },
  handleInput: function(inputField, event) {
    this.setState({
      [inputField]: event.target.value
    });
  },
  handleReactSelectInput: function(inputField, value) {
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
            <label>Whitelist (these tokens must appear in the code)</label>
            <Select
                name="whitelist-select"
                value={this.state.whitelist}
                options={this.options()}
                onChange={this.handleReactSelectInput.bind(this, "whitelist")}
                multi
                simpleValue
                clearable={false}
            />
            <div className="test-results">{this.state.whitelistResults}</div>
            <button onClick={() => this.submitCode("whitelist")}>Check Code</button>
          </li>

          <li>
            <label>Blacklist (these tokens may not appear in the code)</label>
            <Select
                name="blacklist-select"
                value={this.state.blacklist}
                options={this.options()}
                onChange={this.handleReactSelectInput.bind(this, "blacklist")}
                multi
                simpleValue
                clearable={false}
            />
            <div className="test-results">{this.state.blacklistResults}</div>
            <button onClick={() => this.submitCode("blacklist")}>Check Code</button>
          </li>

          <li>
            <label>Structure</label>
            <p className="small-text">
            {/*For some reason this won't automatically break into new lines. "<br/>"*/}
            Use -> to indicate nesting.<br/>
            For instance, ForStatement -> VariableDeclaration, ReturnStatement means <br/> 
            there must be a Variable Declaration and Return Statement <br/>
            inside of a For Statement somewhere in the code.</p>
            <input className="wide-input" onPaste={this.handleInput.bind(this, "structure")} onInput={this.handleInput.bind(this, "structure")}/>
            <div className="test-results">{this.state.structureResults}</div>
            <button onClick={() => this.submitCode("structure")}>Check Code</button>
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
    editor.getSession().setMode("ace/mode/javascript");
    editor.getSession().on('change', this.handleInput);
    this.setState({"editor": editor});
  },
  handleInput: function() {
    console.log("handleInput!");
    this.setState({"code": this.state.editor.getValue()});
  },
  render: function() {
    return(
      <div>
        <div className="float-left" id="editor"></div>
        <Tests code={this.state.code}/>
      </div>
    );
  }
});

var AppContainer = React.createClass({
  render: function() {
    return(
      <div>
        <Instructions title="Challenge API Test Page" 
          hint="This API lets you check for specific constructs inside of your JS code.
            Write some javascript in the box on the left, then use the side panel below to run various tests on it."/>
        <CodeEditor />
      </div>
    );
  }
});

ReactDOM.render(
  <AppContainer/>,
  document.getElementById('content')
);
