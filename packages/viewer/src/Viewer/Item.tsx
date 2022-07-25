/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoIosLink } from "react-icons/io";
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
	const itemReferences = useSelector(
		(state: State) =>
			Object.values(state.item).filter(item =>
				item.children.some(childId => childId === id)
			).length
	);
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
			<div
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
						border: "none",
						verticalAlign: "top",
						background: "none",
					}}
				>
					{item.children.length || isImageSrc(item.content)
						? expanded
							? "-"
							: "+"
						: "•"}
				</button>
				<div
					sx={{
						display: "inline-block",
						width: "calc(100% - 28px)", // adjust for the width of the button
					}}
				>
					{getPathId(selectedPath) === getPathId(path) ? (
						<Fragment>
							<input
								value={item.content}
								onChange={handleChange}
								sx={{
									font: "inherit",
									padding: 0,
									border: "none",
									outline: "none",
									width: "100%",
								}}
								autoFocus
							/>
							{/* <span> {id}</span> hiding the id for now because it's not used */}
						</Fragment>
					) : (
						<span onClick={handleClick}>
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
							{itemReferences > 1 && (
								<span
									title={`Used in ${itemReferences - 1} other list${
										itemReferences > 2 ? "s" : ""
									}`}
									sx={{ color: "primary" }}
								>
									<IoIosLink size="16" />
								</span>
							)}
							&nbsp; &nbsp;
						</span>
					)}
				</div>
			</div>
			{expanded && isImageSrc(item.content) && (
				<div sx={{ paddingLeft: 6 }}>
					<img
						src={possiblyPrependBaseUrl(item.content, baseUrl)}
						sx={{
							width: "400px",
							maxWidth: "100vw",
							my: 4,
							borderRadius: 4,
						}}
					/>
				</div>
			)}
			{item.children &&
				expanded &&
				path.filter(pathId => pathId === id).length < 2 && (
					<ul sx={{ paddingLeft: 5 }}>
						{item.children.map((id, index) => (
							<Item key={`${id}-${index}`} path={[...path, id]} />
						))}
					</ul>
				)}
		</li>
	);
};

export default Item;
