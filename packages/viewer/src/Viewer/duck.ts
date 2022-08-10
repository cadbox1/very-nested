import shortid from "shortid";
import { format, parse, isToday } from "date-fns";
import { createAction, createReducer, PayloadAction } from "@reduxjs/toolkit";

import emptyState from "./emptyState.json";
import {
	getItemInArrayByIndex,
	insertItemInArrayAfter,
	getIndexFromItem,
	removeItemFromArray,
} from "./array-util";

// I sure do regret not calling this root from the start but I can't be bothered updating the template right now
export const ROOT_ID = "vLlFS3csq";

export const DATE_FORMAT = "yyyy-MM-dd";

// Load

type LoadArguments = {
	data: ItemStore;
	force?: Boolean;
};
export const load = createAction<LoadArguments>("LOAD");

// Set BaseURL

type SetBaseUrlArguments = {
	baseUrl: string;
};
export const setBaseUrl = createAction<SetBaseUrlArguments>("SET_BASE_URL");

// Select Item

type SelectItemArguments = {
	nodeId: string;
};
export const selectItem = createAction<SelectItemArguments>("SELECT_ITEM");

// Edit Item

type EditItemArguments = {
	id: string;
	content: string;
};
export const editItem = createAction<EditItemArguments>("EDIT_ITEM");

// Add Item

type AddItemAction = {
	afterNodeId: string;
	id: string;
	content: string;
	children: string[];
};
export const addItem = createAction("ADD", () => ({
	payload: {
		id: shortid.generate(),
		content: "",
		children: [],
	},
}));

// Remove Item

export const removeItem = createAction("REMOVE_ITEM");

// Indent Item

type IndentItemArguments = {
	path: string[];
};
export const indentItem = createAction<IndentItemArguments>("INDENT_ITEM");

// Undent Item

type UndentItemArguments = {
	path: string[];
};
export const undentItem = createAction<UndentItemArguments>("UNDENT_ITEM");

// Move up

type MoveUpArguments = {
	path: string[];
};
export const moveUp = createAction<MoveUpArguments>("MOVE_UP");

// Move down

type MoveDownArguments = {
	path: string[];
};
export const moveDown = createAction<MoveDownArguments>("MOVE_DOWN");

// Up

type UpArguments = {
	path: string[];
};
export const up = createAction<UpArguments>("UP");

// Down

type DownArguments = {
	path: string[];
};
export const down = createAction<MoveDownArguments>("DOWN");

// Expand

type ExpandArguments = {
	path: string[];
};
export const expand = createAction<ExpandArguments>("EXPAND");

// Collapse

type CollapseArguments = {
	path: string[];
};
export const collapse = createAction<CollapseArguments>("COLLAPSE");

// Store

export type Item = {
	id: string;
	content: string;
	error?: string;
	children: string[];
};

export type ItemStore = {
	[key: string]: Item;
};

export type State = {
	baseUrl?: string;
	nodeId?: string;
	item: ItemStore;
	expanded: string[];
};

// Reducer

export const reducer = createReducer(emptyState, {
	// Load

	[load.type]: (state: State, action: PayloadAction<LoadArguments>) => {
		if (action.payload.force) {
			state.expanded = emptyState.expanded;
		}

		state.nodeId = undefined;
		state.item = action.payload.data;

		if (state.expanded.length === 0) {
			// expand the first two levels to start with
			state.expanded = [
				ROOT_ID,
				...state.item[ROOT_ID].children.map(childId =>
					getNodeIdFromPath([ROOT_ID, childId])
				),
			];
		}
	},

	// Set BaseURL

	[setBaseUrl.type]: (
		state: State,
		action: PayloadAction<SetBaseUrlArguments>
	) => {
		state.baseUrl = action.payload.baseUrl;
	},

	// Select Item

	[selectItem.type]: (
		state: State,
		action: PayloadAction<SelectItemArguments>
	) => {
		state.nodeId = action.payload.nodeId;
	},

	// Edit Item

	[editItem.type]: (state: State, action: PayloadAction<EditItemArguments>) => {
		const { id, content } = action.payload;

		// let's not worry about linking for now

		// if (Object.keys(state.item).includes(content)) {
		// 	// content is an id, replace it with a reference to the existing item.
		// 	const referencedItemId = content;
		// 	replaceAllReferencesToId(id, referencedItemId, state);
		// 	deleteItem(id, state);
		// }

		if (!state.nodeId) {
			return;
		}

		const node = new ItemNode({
			nodeId: state.nodeId,
			state,
		});

		node.item.content = content;

		// now handle the timeline

		// the data structure for the timeline is a flat list of dates of the topmost parent
		// the view aggregates those dates into chunks

		if (node.path.includes("timeline")) {
			// don't handle the timeline for timeline edits
			return;
		}

		const timelineNode = ItemNode.getByNodeId({
			nodeId: getNodeIdFromPath([ROOT_ID, "timeline"]),
			state,
		});

		let todaysNodes: ItemNode[] = [];
		let olderNodes: ItemNode[] = [];
		timelineNode?.childNodes.forEach(childNode => {
			const childNodesDate = parse(
				childNode.childNodes[2]?.item.content,
				DATE_FORMAT,
				new Date()
			);
			if (isToday(childNodesDate)) {
				todaysNodes.push(childNode);
			} else {
				olderNodes.push(childNode);
			}
		});

		// update the timeline entry string if it exists
		const existingTimelineNode = todaysNodes.find(
			todayNode => todayNode.childNodes[0].item.id === id
		);
		if (existingTimelineNode) {
			existingTimelineNode.item.content = getTimelineString(node);
			return;
		}

		// if a parent has a timeline entry then there's nothing more to do
		if (
			todaysNodes.some(todayNode =>
				node.parentNode.path.includes(todayNode.childNodes[0].item.id)
			)
		) {
			return;
		}

		// add to timeline
		const timelineId = shortid.generate();

		const timelineDateId = shortid.generate();
		const timelineDateString = format(new Date(), DATE_FORMAT);

		state.item[timelineDateId] = {
			id: timelineDateId,
			content: timelineDateString,
			children: [],
		};

		state.item[timelineId] = {
			id: timelineId,
			content: getTimelineString(node),
			children: [node.item.id, node.parentNode.item.id, timelineDateId],
		};

		// add a timeline if the document doesn't have one already
		if (!state.item["timeline"]) {
			state.item["timeline"] = {
				id: "timeline",
				content: "Timeline",
				children: [],
			};
			state.item[ROOT_ID].children.push("timeline");
		}

		state.item["timeline"].children.unshift(timelineId);

		// @todo unlink any previous references and freeze their contents to x number of levels

		// const oldReferencedNodes = olderNodes.filter(olderNode =>
		// 	node.path.includes(olderNode.childNodes[0].item.id)
		// );
	},

	// Add Item

	[addItem.type]: (state: State, action: PayloadAction<AddItemAction>) => {
		const { id, content, children } = action.payload;

		if (!state.nodeId) {
			return;
		}

		const node = new ItemNode({ nodeId: state.nodeId, state });
		node.insertItemAfterThisNode({ id, content, children });
	},

	// Remove Item

	[removeItem.type]: (state: State, action: any) => {
		const path = getPathFromNodeId(state.nodeId);

		const id = getItemInArrayByIndex(path, -1);
		const parentId = getItemInArrayByIndex(path, -2);
		const collection = state.item[parentId].children;

		const aboveItemId = getIndexFromItem(collection, id, -1);

		removeAllReferencesToId(id, state);
		deleteItem(id, state);

		// select new item
		// this isn't quite right, should use the same logic as UP

		path.pop();
		if (aboveItemId) {
			path.push(aboveItemId);
		}
		state.nodeId = getNodeIdFromPath(path);
	},

	// Indent Item

	[indentItem.type]: (state: State, action: IndentItemArguments) => {
		const { id, collection } = getItemFromPath(
			state.item,
			getPathFromNodeId(state.nodeId)
		);

		const newParentId = getIndexFromItem(collection, id, -1);
		if (!newParentId) {
			return;
		}

		const newParent = state.item[newParentId];
		newParent.children.push(id);

		const path = getPathFromNodeId(state.nodeId);
		path.pop();
		path.push(newParentId, id);
		state.nodeId = getNodeIdFromPath(path);

		const parentPath = path.slice(0, -1);
		const pathId = getNodeIdFromPath(parentPath);
		const expandedSet = new Set(state.expanded);
		expandedSet.add(pathId);
		state.expanded = Array.from(expandedSet);

		removeItemFromArray(collection, id);
	},

	// Undent Item

	[undentItem.type]: (state: State, action: UndentItemArguments) => {
		const { id, parentId, parentsParentId, collection } = getItemFromPath(
			state.item,
			getPathFromNodeId(state.nodeId)
		);

		if (!parentId || !parentsParentId) {
			return;
		}

		const parentsCollection = getCollection(state.item, parentsParentId);
		insertItemInArrayAfter(parentsCollection, parentId, id);

		const path = getPathFromNodeId(state.nodeId);
		path.splice(-2);
		path.push(id);
		state.nodeId = getNodeIdFromPath(path);

		removeItemFromArray(collection, id);
	},

	// Move Up

	[moveUp.type]: (state: State, action: MoveUpArguments) => {
		const { id, index, collection } = getItemFromPath(
			state.item,
			getPathFromNodeId(state.nodeId)
		);

		const aboveItemId = getIndexFromItem(collection, id, -1);

		if (!aboveItemId) {
			return;
		}

		collection[index - 1] = id;
		collection[index] = aboveItemId;
	},

	// Move Down

	[moveDown.type]: (state: State, action: MoveDownArguments) => {
		const { id, index, collection } = getItemFromPath(
			state.item,
			getPathFromNodeId(state.nodeId)
		);

		const belowItemId = getIndexFromItem(collection, id, 1);

		if (!belowItemId) {
			return;
		}

		collection[index + 1] = id;
		collection[index] = belowItemId;
	},

	// Up

	[up.type]: (state: State, action: UpArguments) => {
		if (!state.nodeId) {
			return state;
		}

		const node = new ItemNode({ nodeId: state.nodeId, state });
		node.selectPreviousNode();
	},

	// Down

	[down.type]: (state: State, action: DownArguments) => {
		if (!state.nodeId) {
			return state;
		}

		const node = new ItemNode({ nodeId: state.nodeId, state });
		node.selectNextNode();
	},

	// Expand

	[expand.type]: (state: State, action: PayloadAction<ExpandArguments>) => {
		const pathId = getNodeIdFromPath(action.payload.path);
		const expandedSet = new Set(state.expanded);
		expandedSet.add(pathId);
		state.expanded = Array.from(expandedSet);
	},

	// Collapse

	[collapse.type]: (state: State, action: PayloadAction<CollapseArguments>) => {
		const pathId = getNodeIdFromPath(action.payload.path);
		const expandedSet = new Set(state.expanded);
		expandedSet.delete(pathId);
		state.expanded = Array.from(expandedSet);
	},
});

function getItemFromPath(
	itemStore: ItemStore,
	path: string[]
): {
	id: string;
	index: number;
	parentId: string;
	parentsParentId: string;
	collection: string[];
	children: string[];
} {
	const id = getItemInArrayByIndex(path, -1);
	const parentId = getItemInArrayByIndex(path, -2);
	const parentsParentId = getItemInArrayByIndex(path, -3);

	const collection = parentId ? getCollection(itemStore, parentId) : [];
	const index = collection ? collection.indexOf(id) : -1;

	const children = itemStore[id].children;

	return { id, index, parentId, parentsParentId, collection, children };
}

function getCollection(itemStore: ItemStore, parentId: string): string[] {
	return itemStore[parentId].children;
}

const replaceAllReferencesToId = (
	oldId: string,
	newId: string,
	state: State
) => {
	getAllItemsWithIdInChildren(oldId, state, item => {
		item.children = item.children.map(childId =>
			childId === oldId ? newId : childId
		);
	});
};

const getAllItemsWithIdInChildren = (
	id: string,
	state: State,
	callback: (item: Item) => void
) => {
	Object.keys(state.item).forEach(itemId => {
		const item = state.item[itemId];
		if (item.children.includes(id)) {
			callback(item);
		}
	});
};

const removeAllReferencesToId = (id: string, state: State) => {
	getAllItemsWithIdInChildren(id, state, item => {
		item.children = item.children.filter(childId => childId !== id);
	});
};

const deleteItem = (id: string, state: State) => {
	delete state.item[id];
};

export function getNodeIdFromPath(path: string[]): string {
	return path.join(",");
}

export function getPathFromNodeId(nodeId?: string): string[] {
	if (!nodeId) {
		return [];
	}
	return nodeId.split(",");
}

export class ItemNode {
	nodeId: string;
	path: string[];
	item: Item;
	state: State;

	static getByNodeId({ nodeId, state }: { nodeId: string; state: State }) {
		const path = getPathFromNodeId(nodeId);
		const item = state.item[getItemInArrayByIndex(path, -1)];

		if (!item) {
			return null;
		}

		return new ItemNode({ nodeId, state });
	}

	constructor({ nodeId, state }: { nodeId: string; state: State }) {
		this.nodeId = nodeId;
		this.state = state;

		this.path = getPathFromNodeId(nodeId);
		this.item = this.state.item[getItemInArrayByIndex(this.path, -1)];
	}

	get parentNode() {
		return new ItemNode({
			nodeId: getNodeIdFromPath(this.path.slice(0, -1)),
			state: this.state,
		});
	}

	get childNodes() {
		return this.item.children.map(
			childId =>
				new ItemNode({
					nodeId: getNodeIdFromPath([...this.path, childId]),
					state: this.state,
				})
		);
	}

	get expanded() {
		return this.state.expanded.includes(this.nodeId);
	}

	get index() {
		return this.parentNode.item.children.indexOf(this.item.id);
	}

	get previousSibling(): ItemNode | null {
		if (this.index === 0) {
			return null;
		}
		const siblingId = this.parentNode.childNodes[this.index - 1].item.id;
		const newPath = [...this.parentNode.path, siblingId];
		return new ItemNode({
			nodeId: getNodeIdFromPath(newPath),
			state: this.state,
		});
	}

	get nextSibling(): ItemNode | null {
		if (this.index === this.parentNode.childNodes.length - 1) {
			return null;
		}
		const siblingId = this.parentNode.childNodes[this.index + 1].item.id;
		const newPath = [...this.parentNode.path, siblingId];
		return new ItemNode({
			nodeId: getNodeIdFromPath(newPath),
			state: this.state,
		});
	}

	select() {
		this.state.nodeId = this.nodeId;
	}

	selectNextNode() {
		if (this.expanded) {
			this.childNodes[0].select();
		} else {
			let node: ItemNode = this;
			while (!node.nextSibling) {
				node = node.parentNode;
			}
			node.nextSibling.select();
		}
	}

	selectPreviousNode() {
		if (!this.previousSibling) {
			this.parentNode.select();
			return;
		}

		let node = this.previousSibling;
		while (node.expanded) {
			node = getItemInArrayByIndex(node.childNodes, -1);
		}
		node.select();
	}

	insertItemAfterThisNode(newItem: Item) {
		this.state.item[newItem.id] = newItem;

		// if expanded then add as a new child otherwise add as a new sibling
		if (this.expanded) {
			this.item.children.unshift(newItem.id);
		} else {
			insertItemInArrayAfter(
				this.parentNode.item.children,
				this.item.id,
				newItem.id
			);
		}
		this.selectNextNode();
	}
}

function getTimelineString(node: ItemNode) {
	return `added ${node.item.content} to ${node.parentNode.item.content}`;
}
