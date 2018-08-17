import React, { Component } from "react";
import { connect } from "react-redux";
import { editItem } from "./duck";
import Collection from "./Collection";

class Item extends Component {
  onChange = evt => {
    const { id, onEditItem } = this.props;
    onEditItem({ id, content: evt.target.value });
  };
  render() {
    const { id, content, children } = this.props;
    return (
      <div>
        <input
          value={content}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
          autoFocus
        />
        <Collection parentId={id} children={children} />
      </div>
    );
  }
}
function mapStateToProps(state, props) {
  return { ...state.item[props.id] };
}

export default connect(
  mapStateToProps,
  { onEditItem: editItem }
)(Item);
