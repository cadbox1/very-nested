import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { HotKeys } from "react-hotkeys";
import Item from "./Item";
import { load, up, down, indent, undent, addItem, backspace } from "./duck";

const preventDefault = (func) => (evt) => {
	evt.preventDefault();
	func();
};

class Editor extends Component {
	up = preventDefault(this.props.up);
	down = preventDefault(this.props.down);
	indent = preventDefault(this.props.indent);
	undent = preventDefault(this.props.undent);
	enter = preventDefault(this.props.addItem);

	componentDidMount() {
		if (this.props.content) {
			this.props.load(this.props.content);
		}
	}

	render() {
		const { path } = this.props;
		return (
			<Fragment>
				<HotKeys
					keyMap={{
						up: "up",
						down: "down",
						indent: "tab",
						undent: "shift+tab",
						enter: "enter",
						backspace: "backspace",
					}}
				>
					<HotKeys
						handlers={{
							up: this.up,
							down: this.down,
							indent: this.indent,
							undent: this.undent,
							enter: this.enter,
							backspace: this.props.backspace,
						}}
					>
						<ul>
							<Item path={[path[0]]} />
						</ul>
					</HotKeys>
				</HotKeys>
			</Fragment>
		);
	}
}

function mapStateToProps(state) {
	return { ...state };
}

export default connect(mapStateToProps, {
	load,
	up,
	down,
	indent,
	undent,
	addItem,
	backspace,
})(Editor);
