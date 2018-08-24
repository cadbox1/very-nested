import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { HotKeys } from "react-hotkeys";
import Item from "./Item";
import { up, down, indent, undent, addItem } from "./duck";

const preventDefault = func => evt => {
  evt.preventDefault();
  func();
};

class App extends Component {
  up = preventDefault(this.props.up);
  down = preventDefault(this.props.down);
  indent = preventDefault(this.props.indent);
  undent = preventDefault(this.props.undent);
  render() {
    const { path, addItem } = this.props;
    return (
      <Fragment>
        <HotKeys
          keyMap={{
            up: "up",
            down: "down",
            indent: "tab",
            undent: "shift+tab",
            enter: "enter"
          }}
        >
          <HotKeys
            handlers={{
              up: this.up,
              down: this.down,
              indent: this.indent,
              undent: this.undent,
              enter: addItem
            }}
          >
            <Item path={[path[0]]} />
          </HotKeys>
        </HotKeys>
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return { ...state };
}

export default connect(
  mapStateToProps,
  { up, down, indent, undent, addItem }
)(App);
