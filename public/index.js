var CodeBox = React.createClass({
  getInitialState: function() {
    return {};
  },
  submitCode: function() {
    var code = this.state.code;

    $.ajax({
      url: "/analyze",
      type: "POST",
      dataType: 'json',
      data: {"code": code},
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
  render: function() {
    return(
      <div>
        <textarea value={this.state.code}>
        </textarea>
        <button onClick={this.submitCode}>Check Code</button>
      </div>
    );
  }
});

var AppContainer = React.createClass({
  render: function() {
    return(
      <div>
        Hello Khan Academy
        <CodeBox/>
      </div>
    );
  }
});

ReactDOM.render(
  <AppContainer/>,
  document.getElementById('content')
);
