import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parse, formatRelative } from "date-fns";
import enGB from "date-fns/locale/en-GB";
import {
	DATE_FORMAT,
	expand,
	getNodeIdFromPath,
	getPathFromNodeId,
	ItemNode,
	ROOT_ID,
	State,
} from "./duck";
import { getLastItemInArray } from "./array-util";
import { Node } from "./Node";

const formatRelativeLocale: { [key: string]: string } = {
	lastWeek: "'Last' eeee",
	yesterday: "'Yesterday'",
	today: "'Today'",
	tomorrow: "'Tomorrow'",
	nextWeek: "'Next' eeee",
	other: "dd/MM/yyyy",
};

const locale = {
	...enGB,
	formatRelative: (token: string) => formatRelativeLocale[token],
};

// formatRelative(parse(dateKey, DATE_FORMAT, new Date()), new Date(), { locale });

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

		return entryMap.set(childNodesDateString, [
			...(entryMap.get(childNodesDateString) || []),
			childNode,
		]);
	}, new Map<string, ItemNode[]>());

	console.log(groupedMap);

	return (
		<>
			{groupedMap &&
				Array.from(groupedMap).map(([dateKey, timelineItemNodes]) => (
					<Node
						key={getNodeIdFromPath([...path, dateKey])}
						nodeId={getNodeIdFromPath([...path, dateKey])}
						content={dateKey}
						children={timelineItemNodes.map(
							timelineItemNode => timelineItemNode.nodeId
						)}
						expanded
						readonly
					/>
				))}
		</>
	);
};
