import React from "react";
import { useSelector } from "react-redux";
import { parse, formatDistance } from "date-fns";
import enGB from "date-fns/locale/en-GB";
import {
	DATE_FORMAT,
	getNodeIdFromPath,
	getPathFromNodeId,
	ItemNode,
	ROOT_ID,
	State,
} from "./duck";
import { Node } from "./Node";

const locale: Locale = {
	...enGB,
	formatDistance: (...args) => {
		const [arg1, ...otherArgs] = args;

		const todayKeys = ["lessThanXMinutes", "xMinutes", "aboutXHours"];

		if (todayKeys.includes(arg1)) {
			return "Today";
		}
		// @ts-ignore
		return enGB.formatDistance(...args);
	},
};

export interface TimelineNodeProps {
	nodeId: string;
}

export const TimelineNode = ({ nodeId }: TimelineNodeProps) => {
	const path = getPathFromNodeId(nodeId);

	const state = useSelector((state: State) => state);
	const timelineNode = ItemNode.getByNodeId({
		nodeId: getNodeIdFromPath([ROOT_ID, "timeline"]),
		state,
	});

	const groupedMap = timelineNode?.childNodes.reduce((entryMap, childNode) => {
		const childNodesDateString =
			childNode.childNodes[2]?.item.content ||
			childNode.item.content.split(" - ")[0];

		const relativeDate = formatDistance(
			parse(childNodesDateString, DATE_FORMAT, new Date()),
			new Date(),
			{
				addSuffix: true,
				locale,
			}
		);

		return entryMap.set(relativeDate, [
			...(entryMap.get(relativeDate) || []),
			childNode,
		]);
	}, new Map<string, ItemNode[]>());

	return (
		<Node
			nodeId={getNodeIdFromPath([ROOT_ID, "timeline"])}
			content="Timeline"
			readonly
			expanded
			children={
				groupedMap
					? Array.from(groupedMap).map(
							([dateLabel, timelineItemNodes], index) => ({
								nodeId: getNodeIdFromPath([...path, dateLabel]),
								content: dateLabel,
								children: timelineItemNodes.map(
									timelineItemNode => timelineItemNode.nodeId
								),
								readonly: false,
								expanded: index === 0,
							})
					  )
					: []
			}
		/>
	);
};
