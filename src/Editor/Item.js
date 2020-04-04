import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { editItem, select, processState } from "./duck";

class Item extends Component {
	handleChange = evt => {
		const { id, onEditItem } = this.props;
		onEditItem({ id, content: evt.target.value });
	};
	handleClick = evt => {
		const { path, onSelect } = this.props;
		onSelect({ path });
	};
	handleBlur = () => {
		this.props.processState();
	};
	handleFocus = () => {
		this.props.processState();
	};
	render() {
		const { id, content, error, path, globalPath, children } = this.props;
		return (
			<li>
				{globalPath.join() === path.join() ? (
					<Fragment>
						<input
							value={content}
							onChange={this.handleChange}
							onBlur={this.handleBlur}
							onFocus={this.handleFocus} // not entirely sure why we need this
							autoFocus
						/>
						<span> - {error || id}</span>
					</Fragment>
				) : (
					<span
						onClick={this.handleClick}
						style={{ color: content.startsWith("calculation: ") && "green" }}
					>
						{content}
					</span>
				)}
				{children && path.filter(pathId => pathId === id).length < 2 && (
					<ul>
						{children.map(id => (
							<ConnectedItem key={id} path={[...path, id]} />
						))}
					</ul>
				)}
			</li>
		);
	}
}
function mapStateToProps(state, props) {
	const id = props.path.slice(-1)[0];
	return { ...state.item[id], id, globalPath: state.path };
}

const ConnectedItem = connect(mapStateToProps, {
	onEditItem: editItem,
	onSelect: select,
	processState,
})(Item);

export default ConnectedItem;
