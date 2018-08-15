import React, { Component } from "react";
import Item from "./Item";

class Collection extends Component {
  render() {
    const { children, parentId } = this.props;
    if (!children) {
      return false;
    }
    return (
      children && (
        <div style={{ marginLeft: "1rem" }}>
          {children.map(childItemId => (
            <Item key={childItemId} id={childItemId} parentId={parentId} />
          ))}
        </div>
      )
    );
  }
}

export default Collection;
