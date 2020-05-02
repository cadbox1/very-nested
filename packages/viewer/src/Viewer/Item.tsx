import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	editItem,
	selectItem,
	State,
	collapse,
	expand,
	getPathId,
} from "./duck";
import { last } from "./array-util";
import { FaCircle } from "react-icons/fa";
import { IoIosRemove } from "react-icons/io";

export interface ItemProps {
	path: Array<string>;
}

const Item = ({ path }: ItemProps) => {
	const id = last(path);

	const dispatch = useDispatch();
	const item = useSelector((state: State) => state.item[id]);
	const selectedPath = useSelector((state: State) => state.path);
	const expanded = useSelector((state: State) =>
		state.expanded.includes(getPathId(path))
	);

	if (!item) {
		throw new Error(
			`No item with id: "${id}" found in state, path: ${JSON.stringify(path)}.`
		);
	}

	const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(editItem({ id, content: evt.target.value }));
	};
	const handleClick = () => {
		dispatch(selectItem({ path }));
	};
	const handleExpandCollpase = () => {
		if (!item.children.length) {
			return;
		}
		if (expanded) {
			dispatch(collapse({ path }));
		} else {
			dispatch(expand({ path }));
		}
	};
	return (
		<li style={{ listStyleType: "none" }}>
			<span>
				<button onClick={handleExpandCollpase} style={{ border: "none" }}>
					{item.children.length ? (expanded ? "-" : "+") : "•"}
				</button>
				{selectedPath.join() === path.join() ? (
					<Fragment>
						<input
							value={item.content}
							onChange={handleChange}
							autoFocus
							style={{ fontSize: "1rem" }}
						/>
						<span> {id}</span>
					</Fragment>
				) : (
					<span
						onClick={handleClick}
						style={{
							display: "inline-block",
							minHeight: "1rem",
						}}
					>
						{item.content}
					</span>
				)}
			</span>
			{item.children &&
				expanded &&
				path.filter(pathId => pathId === id).length < 2 && (
					<ul style={{ paddingLeft: "1.5rem" }}>
						{item.children.map((id: string) => (
							<Item key={id} path={[...path, id]} />
						))}
					</ul>
				)}
		</li>
	);
};

export default Item;
