import React from "react";
import { useSelector } from "react-redux";
import { parse, formatDistance } from "date-fns";
import {
	DATE_FORMAT,
	getGroupedTimeline,
	getNodeIdFromPath,
	getPathFromNodeId,
	ItemNode,
	State,
} from "./duck";
import { Node } from "./Node";

export interface TimelineNodeProps {
	nodeId: string;
}

export const TimelineNode = ({ nodeId }: TimelineNodeProps) => {
	const path = getPathFromNodeId(nodeId);

	const state = useSelector((state: State) => state);

	const groupedTimeline = getGroupedTimeline(state);

	return (
		<Node
			nodeId={nodeId}
			content="Timeline"
			children={groupedTimeline.map((timelineGroup, index) => ({
				nodeId: getNodeIdFromPath([...path, timelineGroup.id]),
				content: timelineGroup.content,
				children: timelineGroup.children,
				readonly: false,
				expanded: index === 0, // expand the first timeline entry to start with
			}))}
			readonly
			expanded
		/>
	);
};
