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
import { isHref, possiblyPrependBaseUrl, isImageSrc } from "./isHref";

export interface ItemProps {
	path: Array<string>;
}

const Item = ({ path }: ItemProps) => {
	const id = last(path);

	const dispatch = useDispatch();
	const readonly = useSelector((state: State) => state.readonly);
	const baseUrl = useSelector((state: State) => state.baseUrl);
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
		if (!item.children.length && !isImageSrc(item.content)) {
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
			<span
				sx={{
					fontSize: 1,
					lineHeight: 1.6,
					paddingRight: 4,
					variant: "viewer.item",
				}}
			>
				<button
					onClick={handleExpandCollpase}
					sx={{
						font: "inherit",
						width: "28px",
						px: 2,
						mr: 1,
						border: "none",
						background: "none",
					}}
				>
					{item.children.length || isImageSrc(item.content)
						? expanded
							? "-"
							: "+"
						: "•"}
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
							paddingRight: "5rem",
						}}
					>
						{isHref(item.content) ? (
							<Styled.a
								href={possiblyPrependBaseUrl(item.content, baseUrl)}
								target="_blank"
								rel="noopener noreferrer"
							>
								{decodeURI(item.content)}
							</Styled.a>
						) : (
							item.content
						)}
						&nbsp;
					</span>
				)}
			</span>
			{expanded && isImageSrc(item.content) && (
				<div sx={{ paddingLeft: 6 }}>
					<img
						src={possiblyPrependBaseUrl(item.content, baseUrl)}
						width="400"
					/>
				</div>
			)}
			{item.children &&
				expanded &&
				path.filter(pathId => pathId === id).length < 2 && (
					<ul sx={{ paddingLeft: 5 }}>
						{item.children.map((id: string) => (
							<Item key={id} path={[...path, id]} />
						))}
					</ul>
				)}
		</li>
	);
};

export default Item;
