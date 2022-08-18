/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import React, { useEffect } from "react";
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
import { getLastItemInArray } from "./array-util";
import { isHref, possiblyPrependBaseUrl, isImageSrc } from "./isHref";
import { TimelineNode } from "./TimelineNode";
import { ItemNode } from "./ItemNode";

export interface NodeProps {
	nodeId: string;
	content: string;
	children: Array<string | NodeProps>;
	expanded: boolean;
	readonly: boolean;
}

export const Node = ({
	nodeId,
	content,
	children,
	expanded: expandedProp,
	readonly,
}: NodeProps) => {
	const path = getPathFromNodeId(nodeId);
	const itemId = getLastItemInArray(path);

	const isRoot = itemId === ROOT_ID;

	const baseUrl = useSelector((state: State) => state.baseUrl);

	const selectedNodeId = useSelector((state: State) => state.nodeId);
	const expanded = useSelector((state: State) =>
		state.expanded.includes(nodeId)
	);

	const dispatch = useDispatch();

	useEffect(() => {
		if (expandedProp) {
			dispatch(expand({ path }));
		}
	}, [expandedProp]);

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
		if (!children.length && !isImageSrc(content)) {
			return;
		}
		if (expanded) {
			dispatch(collapse({ path }));
		} else {
			dispatch(expand({ path }));
		}
	};

	return (
		<li sx={{ listStyleType: "none" }}>
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
							padding: 0,
							border: "none",
							textAlign: "center",
							verticalAlign: "top",
							background: "none",
						}}
					>
						{children.length || isImageSrc(content)
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
							{isHref(content) ? (
								<Styled.a
									href={possiblyPrependBaseUrl(content, baseUrl)}
									target="_blank"
									rel="noopener noreferrer"
								>
									{decodeURI(content)}
								</Styled.a>
							) : (
								content
							)}
							&nbsp;&nbsp; &nbsp;
						</span>

						{selectedNodeId === nodeId && (
							<input
								value={content}
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
			{expanded && isImageSrc(content) && (
				<div sx={{ paddingLeft: 6 }}>
					<img
						src={possiblyPrependBaseUrl(content, baseUrl)}
						sx={{
							width: "400px",
							maxWidth: "100vw",
							my: 4,
							borderRadius: 4,
						}}
					/>
				</div>
			)}
			{children && expanded && (
				<ul sx={{ paddingLeft: isRoot ? 0 : 4, mb: 1 }}>
					{children.map(child =>
						child === "timeline" ? (
							<TimelineNode
								key={getNodeIdFromPath([...path, child])}
								nodeId={getNodeIdFromPath([...path, child])}
							/>
						) : typeof child === "string" ? (
							<ItemNode
								key={getNodeIdFromPath([...path, child])}
								nodeId={getNodeIdFromPath([...path, child])}
								readonly={readonly}
							/>
						) : (
							<Node
								key={getNodeIdFromPath([...path, child.content])}
								nodeId={getNodeIdFromPath([...path, child.content])}
								content={child.content}
								children={child.children}
								readonly={child.readonly}
								expanded={child.expanded}
							/>
						)
					)}
				</ul>
			)}
		</li>
	);
};
