import React from 'react';
import logo from './logo.svg';
import './App.css';
import './base.css';

import $ from 'jquery';

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/github';

class Instructions extends React.Component{
  render() {
    return(
      <div>
        <h2 className="white-heading-text">JavaScript Static Analyzer</h2>
        <div id="challenge-task-container" className="objectives-pane-outer">
          <div id="objectives-pane" className="min-contained-and-centered"><h2>{this.props.title}</h2>
            <div className="challenge-step">
              <div className="test-structure">
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
}

class Tests extends React.Component{
  options() {
    return this.validTerms.map(function(term) { return {label: term, value: term}}); // arrow function gives error here.
  }
  constructor(props) {
  	super(props);
    this.state = {
      "whitelist": "",
      "blacklist": "",
      "structure": "",
      "whitelistResults": "",
      "blacklistResults": "",
      "structureResults": ""
    };
  this.validTerms = ["Node", "Identifier", "Literal", "RegExpLiteral", "Program", "Function", "Statement",
    "ExpressionStatement", "BlockStatement", "EmptyStatement", "DebuggerStatement", "WithStatement",
    "ReturnStatement", "LabeledStatement", "BreakStatement", "ContinueStatement", "IfStatement",
    "SwitchStatement", "SwitchCase", "ThrowStatement", "TryStatement", "CatchClause", "WhileStatement",
    "DoWhileStatement", "ForStatement", "ForInStatement", "Declaration", "FunctionDeclaration",
    "VariableDeclaration", "VariableDeclarator", "Expression", "ThisExpression", "ArrayExpression",
    "ObjectExpression", "Property", "FunctionExpression", "UnaryExpression", "UnaryOperator", "UpdateExpression",
    "UpdateOperator", "BinaryExpression", "BinaryOperator", "AssignmentExpression", "AssignmentOperator", "LogicalExpression",
    "LogicalOperator", "MemberExpression", "ConditionalExpression", "CallExpression", "NewExpression",
    "SequenceExpression", "Pattern"]
  }
  submitCode(fn) {
    $.ajax({
      url: "/analyze/" + fn,
      type: "POST",
      dataType: 'json',
      data: {
        "code": this.props.code,
        [fn]: this.state[fn]
      },
      timeout: 3000,
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
      }.bind(this)
    });
  }
  handleInput(inputField, event) {
    this.setState({
      [inputField]: event.target.value
    });
  }
  handleReactSelectInput(inputField, value) {
    this.setState({
      [inputField]: value
    });
  }
  render() {
    return(
      <div className="float-left horiz-space-2">
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
}

class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {code: 
`function fibonacci(num){
  var a = 1, b = 0, temp;

  while (num >= 0){
    temp = a;
    a = a + b;
    b = temp;
    num--;
  }

  return b;
}
`};
  }
  handleInput(newVal) {
	this.setState((prevState, props) => ({
  	  code: newVal
	}));
  }
  render() {
  	  return (
	<div id='ace-container'>
  	  <AceEditor
    	mode="javascript"
    	theme="github"
    	onChange={this.handleInput.bind(this)}
    	name="editor"
    	editorProps={{$blockScrolling: true}}
    	className="float-left"
    	value={this.state.code}
  	  />
      <Tests code={this.state.code}/>
  </div>
  	  );
  }
}

class AppContainer extends React.Component{
  render() {
    return(
      <div>
        <Instructions title="Challenge API Test Page" 
          hint="This API lets you check for specific constructs inside of your JS code.
            Write some javascript in the box on the left, then use the side panel below to run various tests on it."/>
        <CodeEditor />
      </div>
    );
  }
}

export default AppContainer;