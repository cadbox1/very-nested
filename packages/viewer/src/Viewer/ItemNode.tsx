import React from "react";
import { useSelector } from "react-redux";
import { getLastItemInArray } from "./array-util";
import { getPathFromNodeId, State } from "./duck";
import { Node } from "./Node";

interface ItemNodeProps {
	nodeId: string;
	readonly: boolean;
}

export const ItemNode = ({ nodeId, readonly }: ItemNodeProps) => {
	const path = getPathFromNodeId(nodeId);
	const itemId = getLastItemInArray(path);

	const item = useSelector((state: State) => state.item[itemId]);

	return (
		<Node
			nodeId={nodeId}
			content={item.content}
			children={item.children}
			expanded={false}
			readonly={readonly}
		/>
	);
};
