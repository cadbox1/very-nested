import shortid from "shortid";
import { format } from "date-fns";
import { createAction, createReducer, PayloadAction } from "@reduxjs/toolkit";

import emptyState from "./emptyState.json";
import {
	getIndex,
	insertAfter,
	getIndexFromItem,
	removeItemFromArray,
} from "./array-util";

// I sure do regret not calling this root from the start but I can't be bothered updating the template right now
export const ROOT_ID = "vLlFS3csq";

// Load

type LoadArguments = {
	data: ItemStore;
	force?: Boolean;
};
export const load = createAction<LoadArguments>("LOAD");

// Set ReadOnly

type SetReadOnlyArguments = {
	readonly: boolean;
};
export const setReadOnly = createAction<SetReadOnlyArguments>("SET_READONLY");

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

type AddItemArguments = {
	afterNodeId?: string;
};
type AddItemAction = {
	afterNodeId: string;
	id: string;
	content: string;
	children: string[];
};
export const addItem = createAction(
	"ADD",
	({ afterNodeId }: AddItemArguments) => ({
		payload: {
			id: shortid.generate(),
			afterNodeId,
			content: "",
			children: [],
		},
	})
);

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

export type ItemState = {
	id: string;
	content: string;
	error?: string;
	children: string[];
};

export type ItemStore = {
	[key: string]: ItemState;
};

export type State = {
	readonly: boolean;
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

	// Set ReadOnly

	[setReadOnly.type]: (
		state: State,
		action: PayloadAction<SetReadOnlyArguments>
	) => {
		state.readonly = action.payload.readonly;
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

		if (Object.keys(state.item).includes(content)) {
			// content is an id, replace it with a reference to the existing item.
			const referencedItemId = content;
			replaceAllReferencesToId(id, referencedItemId, state);
			deleteItem(id, state);
		} else {
			const item = state.item[id];
			item.content = content;

			if (!getPathFromNodeId(state.nodeId).includes("timeline")) {
				// add to timeline
				const existingTimelineId = state.item[
					"timeline"
				]?.children.find(childId =>
					state.item[childId].children.includes(id) ? id : null
				);

				let timelineId = existingTimelineId;
				if (!timelineId) {
					timelineId = shortid.generate();
					state.item[timelineId] = {
						id: timelineId,
						content: ``,
						children: [id],
					};

					// some older documents don't have a timeline, let's add one. Maybe this should be optional?
					if (!state.item["timeline"]) {
						state.item["timeline"] = {
							id: "timeline",
							content: "Timeline",
							children: [],
						};
						state.item[ROOT_ID].children.push("timeline");
					}

					state.item["timeline"].children.unshift(timelineId);
				}
				state.item[timelineId].content = `${format(
					new Date(),
					"yyyy-MM-dd"
				)} - added ${content} to ${
					state.item[getIndex(getPathFromNodeId(state.nodeId), -2)].content
				}`;
			}
		}
	},

	// Add Item

	[addItem.type]: (state: State, action: PayloadAction<AddItemAction>) => {
		const { id, afterNodeId, content, children } = action.payload;

		// @todo: hitting enter on an item that has children expanded should make a new first child

		state.item[id] = {
			id,
			content,
			children,
		};

		const { id: afterId, collection } = getItemFromPath(
			state.item,
			getPathFromNodeId(afterNodeId)
		);

		insertAfter(collection, afterId, id);

		// select new item
		const path = getPathFromNodeId(state.nodeId);
		path.pop();
		path.push(id);
		state.nodeId = getNodeIdFromPath(path);
	},

	// Remove Item

	[removeItem.type]: (state: State, action: any) => {
		const path = getPathFromNodeId(state.nodeId);

		const id = getIndex(path, -1);
		const parentId = getIndex(path, -2);
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
		insertAfter(parentsCollection, parentId, id);

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
		const { id, collection } = getItemFromPath(
			state.item,
			getPathFromNodeId(state.nodeId)
		);
		let aboveItemId = getIndexFromItem(collection, id, -1);

		const path = getPathFromNodeId(state.nodeId);

		if (!aboveItemId) {
			// select the parent
			path.pop();
			return;
		}

		path.pop();
		path.push(aboveItemId);
		state.nodeId = getNodeIdFromPath(path);

		const maxIterations = 100;

		let item = state.item[aboveItemId];
		let iteration = 1;

		while (
			item &&
			item.children.length > 0 &&
			state.nodeId &&
			state.expanded.includes(state.nodeId) &&
			iteration < maxIterations
		) {
			const lastChildId = getIndex(item.children, -1);
			path.push(lastChildId);
			state.nodeId = getNodeIdFromPath(path);
			item = state.item[lastChildId];
			iteration++;
		}

		if (iteration === maxIterations) {
			console.error("maximum iterations reached for 'up'");
		}
	},

	// Down

	[down.type]: (state: State, action: DownArguments) => {
		if (!state.nodeId) {
			return state;
		}
		const path = getPathFromNodeId(state.nodeId);
		let item = getItemFromPath(state.item, getPathFromNodeId(state.nodeId));

		// check children
		if (item.children.length > 0 && state.expanded.includes(state.nodeId)) {
			path.push(item.children[0]);
			state.nodeId = getNodeIdFromPath(path);
			return;
		}

		// check siblings
		let belowItemId = getIndexFromItem(item.collection, item.id, 1);

		// check parents
		while (!belowItemId && path.length > 1) {
			path.pop();
			state.nodeId = getNodeIdFromPath(path);
			item = getItemFromPath(state.item, path);
			belowItemId = getIndexFromItem(item.collection, item.id, 1);
		}

		path.pop();
		path.push(belowItemId);
		state.nodeId = getNodeIdFromPath(path);
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
	const id = getIndex(path, -1);
	const parentId = getIndex(path, -2);
	const parentsParentId = getIndex(path, -3);

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
	callback: (item: ItemState) => void
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
