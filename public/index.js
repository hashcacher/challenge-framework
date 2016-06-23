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
  handleInput: function(inputField, event) {
    this.setState({
      [inputField]: event.target.value
    });
  },
  render: function() {
    return(
      <div className="float-left horiz-space-2">
        <p>Here you can test the new API. Available terms for whitelist and blacklist can be found <a href="https://github.com/estree/estree/blob/master/spec.md">here</a>.</p>
        <ul>
          <li>
            <label>Whitelist (, separated)</label><input onInput={this.handleInput.bind(this, "whitelist")} className="wide-input"/>
            <div className="test-results">{this.state.whitelistResults}</div>
            <button onClick={() => this.submitCode("whitelist")}>Check Code</button>
          </li>

          <li>
            <label>Blacklist (, separated)</label><input onInput={this.handleInput.bind(this, "blacklist")} className="wide-input"/>
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
