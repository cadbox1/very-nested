import React, { Component } from "react";
import { connect } from "react-redux";
import { editItem, select } from "./duck";

class Item extends Component {
  handleChange = evt => {
    const { onEditItem } = this.props;
    onEditItem({ content: evt.target.value });
  };
  handleClick = evt => {
    const { path, onSelect } = this.props;
    onSelect({ path });
  };
  render() {
    const { id, content, path, globalPath, children } = this.props;
    return (
      <div>
        {globalPath.slice(-1)[0] === id ? (
          <input value={content} onChange={this.handleChange} autoFocus />
        ) : (
          <div>
            <span onClick={this.handleClick}>{content}</span>
            <span> - {id}</span>
          </div>
        )}
        {children && (
          <div style={{ marginLeft: "1rem" }}>
            {children.map(id => (
              <ConnectedItem key={id} path={[...path, id]} />
            ))}
          </div>
        )}
      </div>
    );
  }
}
function mapStateToProps(state, props) {
  const id = props.path.slice(-1)[0];
  return { ...state.item[id], id, globalPath: state.path };
}

const ConnectedItem = connect(
  mapStateToProps,
  { onEditItem: editItem, onSelect: select }
)(Item);

export default ConnectedItem;
