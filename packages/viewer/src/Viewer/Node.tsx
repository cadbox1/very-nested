/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	editItem,
	selectItem,
	State,
	collapse,
	expand,
	getPathFromNodeId,
	getNodeIdFromPath,
	ROOT_ID,
} from "./duck";
import { last } from "./array-util";
import { isHref, possiblyPrependBaseUrl, isImageSrc } from "./isHref";

export interface NodeProps {
	nodeId: string;
}

const Node = ({ nodeId }: NodeProps) => {
	const path = getPathFromNodeId(nodeId);
	const itemId = last(path);

	const dispatch = useDispatch();
	const readonly = useSelector((state: State) => state.readonly);
	const baseUrl = useSelector((state: State) => state.baseUrl);
	const item = useSelector((state: State) => state.item[itemId]);
	const itemReferences = useSelector(
		(state: State) =>
			Object.values(state.item).filter(item =>
				item.children.some(childId => childId === itemId)
			).length
	);
	const selectedNodeId = useSelector((state: State) => state.nodeId);
	const expanded = useSelector((state: State) =>
		state.expanded.includes(nodeId)
	);

	if (!item) {
		throw new Error(
			`No item with id: "${itemId}" found in state, path: ${JSON.stringify(
				path
			)}.`
		);
	}

	const isRoot = nodeId === ROOT_ID;

	const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(editItem({ id: itemId, content: evt.target.value }));
	};

	const handleClick = () => {
		if (readonly) {
			handleExpandCollpase();
		} else {
			dispatch(selectItem({ nodeId }));
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
			{!isRoot && (
				<div
					sx={{
						fontSize: 1,
						paddingRight: 4,
						variant: "viewer.item",
					}}
				>
					<button
						onClick={handleExpandCollpase}
						sx={{
							font: "inherit",
							width: "30px",
							border: "none",
							textAlign: "center",
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
							width: "calc(100% - 30px)", // adjust for the width of the button
							position: "relative",
						}}
					>
						<span
							onClick={handleClick}
							sx={{
								visibility: selectedNodeId === nodeId ? "hidden" : "visible",
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
							&nbsp;&nbsp; &nbsp;
						</span>

						{selectedNodeId === nodeId && (
							<input
								value={item.content}
								onChange={handleChange}
								sx={{
									font: "inherit",
									padding: 0,
									border: "none",
									outline: "none",
									width: "100%",
									position: "absolute",
									top: 0,
									left: 0,
								}}
								autoFocus
							/>
						)}
					</div>
				</div>
			)}
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
				path.filter(pathId => pathId === itemId).length < 2 && (
					<ul sx={{ paddingLeft: isRoot ? 0 : 4, mb: 1 }}>
						{item.children.map((id, index) => (
							<Node
								key={getNodeIdFromPath([...path, id])}
								nodeId={getNodeIdFromPath([...path, id])}
							/>
						))}
					</ul>
				)}
		</li>
	);
};

export default Node;
