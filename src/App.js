import React, { Component } from "react";
import { connect } from "react-redux";
import Item from "./Item";

class App extends Component {
  render() {
    return <Item id="root" />;
  }
}

function mapStateToProps(state) {
  return { ...state };
}

export default connect(mapStateToProps)(App);
