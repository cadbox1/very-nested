/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
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
import { isHref } from "./isHref";

export interface ItemProps {
	path: Array<string>;
}

const Item = ({ path }: ItemProps) => {
	const id = last(path);

	const dispatch = useDispatch();
	const readonly = useSelector((state: State) => state.readonly);
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
		if (readonly) {
			handleExpandCollpase();
		} else {
			dispatch(selectItem({ path }));
		}
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
			<span sx={{ fontSize: 2, lineHeight: 1.5, paddingRight: 4 }}>
				<button
					onClick={handleExpandCollpase}
					sx={{ width: "1rem", mr: 1, border: "none", background: "none" }}
				>
					{item.children.length ? (expanded ? "-" : "+") : "•"}
				</button>
				{getPathId(selectedPath) === getPathId(path) ? (
					<Fragment>
						<input
							key={getPathId(path)}
							value={item.content}
							onChange={handleChange}
							sx={{ fontSize: "1rem" }}
							ref={input => input?.focus()}
						/>
						<span> {id}</span>
					</Fragment>
				) : (
					<span
						onClick={handleClick}
						style={{
							display: "inline-block",
							padding: "0 5rem 0 0",
							minHeight: "1rem",
						}}
					>
						{isHref(item.content) ? (
							<Styled.a
								href={item.content}
								target="_blank"
								rel="noopener noreferrer"
							>
								{item.content}
							</Styled.a>
						) : (
							item.content
						)}
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
