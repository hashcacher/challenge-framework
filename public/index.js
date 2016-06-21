var Tests = React.createClass({
  getInitialState: function() {
    return {
      "whitelist": "",
      "blacklist": "",
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
        fn: this.state.fn
      },
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({
          "syntax": data
        });
      }.bind(this),
      error: function(xhr, status, err) {
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
      <div className="horiz-space">
        <label>Whitelist (, separated)</label><input onChange={this.handleInput.bind(this, "whitelist")}/>
        <button onClick={() => this.submitCode("whitelist")}>Check Code</button>

        <label>Blacklist (, separated)</label><input onChange={this.handleInput.bind(this, "blacklist")}/>
        <button onClick={() => this.submitCode("blacklist")}>Check Code</button>
        
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
        <h3>Hello Khan Academy</h3>
        <CodeEditor />
      </div>
    );
  }
});

ReactDOM.render(
  <AppContainer/>,
  document.getElementById('content')
);
