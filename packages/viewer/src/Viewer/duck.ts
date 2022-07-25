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

type LoadArguments = {
	data: ItemStore;
	force?: Boolean;
};
export const load = createAction<LoadArguments>("LOAD");

type SetReadOnlyArguments = {
	readonly: boolean;
};
export const setReadOnly = createAction<SetReadOnlyArguments>("SET_READONLY");

type SetBaseUrlArguments = {
	baseUrl: string;
};
export const setBaseUrl = createAction<SetBaseUrlArguments>("SET_BASE_URL");

type SelectItemArguments = {
	path: string[];
};
export const selectItem = createAction<SelectItemArguments>("SELECT_ITEM");

type EditItemArguments = {
	id: string;
	content: string;
};
export const editItem = createAction<EditItemArguments>("EDIT_ITEM");

type AddItemArguments = {
	afterPath: string[];
};
type AddItemAction = {
	afterPath: string[];
	id: string;
	content: string;
	children: string[];
};
export const addItem = createAction(
	"ADD",
	({ afterPath }: AddItemArguments) => ({
		payload: {
			id: shortid.generate(),
			afterPath,
			content: "",
			children: [],
		},
	})
);

type RemoveItemArguments = {
	path: string[];
};
export const removeItem = createAction<RemoveItemArguments>("REMOVE_ITEM");

type IndentItemArguments = {
	path: string[];
};
export const indentItem = createAction<IndentItemArguments>("INDENT_ITEM");

type UndentItemArguments = {
	path: string[];
};
export const undentItem = createAction<UndentItemArguments>("UNDENT_ITEM");

type MoveUpArguments = {
	path: string[];
};
export const moveUp = createAction<MoveUpArguments>("MOVE_UP");

type MoveDownArguments = {
	path: string[];
};
export const moveDown = createAction<MoveDownArguments>("MOVE_DOWN");

type UpArguments = {
	path: string[];
};
export const up = createAction<UpArguments>("UP");

type DownArguments = {
	path: string[];
};
export const down = createAction<MoveDownArguments>("DOWN");

type ExpandArguments = {
	path: string[];
};
export const expand = createAction<ExpandArguments>("EXPAND");

type CollapseArguments = {
	path: string[];
};
export const collapse = createAction<CollapseArguments>("COLLAPSE");

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
	path: string[];
	item: ItemStore;
	expanded: string[];
};

export const reducer = createReducer(emptyState, {
	[load.type]: (state: State, action: PayloadAction<LoadArguments>) => {
		if (action.payload.force) {
			state.expanded = emptyState.expanded;
		}

		state.path = [];
		state.item = action.payload.data;

		if (state.expanded.length === 0) {
			// expand the first two levels to start with
			state.expanded = [
				ROOT_ID,
				...state.item[ROOT_ID].children.map(childId =>
					getPathId([ROOT_ID, childId])
				),
			];
		}
	},

	[setReadOnly.type]: (
		state: State,
		action: PayloadAction<SetReadOnlyArguments>
	) => {
		state.readonly = action.payload.readonly;
	},

	[setBaseUrl.type]: (
		state: State,
		action: PayloadAction<SetBaseUrlArguments>
	) => {
		state.baseUrl = action.payload.baseUrl;
	},

	[selectItem.type]: (
		state: State,
		action: PayloadAction<SelectItemArguments>
	) => {
		state.path = action.payload.path;
	},

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
			)} - added ${content} to ${state.item[getIndex(state.path, -2)].content}`;
		}
	},

	[addItem.type]: (state: State, action: PayloadAction<AddItemAction>) => {
		const { id, afterPath, content, children } = action.payload;

		// @todo: hitting enter on an item that has children expanded should make a new first child

		state.item[id] = {
			id,
			content,
			children,
		};

		const { id: afterId, collection } = getItemFromPath(state.item, afterPath);

		insertAfter(collection, afterId, id);

		// select new item
		state.path.pop();
		state.path.push(id);
	},

	[removeItem.type]: (state: State, action: any) => {
		const { path } = action.payload;

		const id = getIndex(path, -1);
		const parentId = getIndex(path, -2);
		const collection = state.item[parentId].children;

		const aboveItemId = getIndexFromItem(collection, id, -1);

		removeAllReferencesToId(id, state);
		deleteItem(id, state);

		// select new item
		// this isn't quite right, should use the same logic as UP
		state.path.pop();
		if (aboveItemId) {
			state.path.push(aboveItemId);
		}
	},

	[indentItem.type]: (state: State, action: IndentItemArguments) => {
		const { id, collection } = getItemFromPath(state.item, state.path);

		const newParentId = getIndexFromItem(collection, id, -1);
		if (!newParentId) {
			return;
		}

		const newParent = state.item[newParentId];
		newParent.children.push(id);

		state.path.pop();
		state.path.push(newParentId, id);

		const parentPath = state.path.slice(0, -1);
		const pathId = getPathId(parentPath);
		const expandedSet = new Set(state.expanded);
		expandedSet.add(pathId);
		state.expanded = Array.from(expandedSet);

		removeItemFromArray(collection, id);
	},

	[undentItem.type]: (state: State, action: UndentItemArguments) => {
		const { id, parentId, parentsParentId, collection } = getItemFromPath(
			state.item,
			state.path
		);

		if (!parentId || !parentsParentId) {
			return;
		}

		const parentsCollection = getCollection(state.item, parentsParentId);
		insertAfter(parentsCollection, parentId, id);

		state.path.splice(-2);
		state.path.push(id);

		removeItemFromArray(collection, id);
	},

	[moveUp.type]: (state: State, action: MoveUpArguments) => {
		const { id, index, collection } = getItemFromPath(state.item, state.path);

		const aboveItemId = getIndexFromItem(collection, id, -1);

		if (!aboveItemId) {
			return;
		}

		collection[index - 1] = id;
		collection[index] = aboveItemId;
	},

	[moveDown.type]: (state: State, action: MoveDownArguments) => {
		const { id, index, collection } = getItemFromPath(state.item, state.path);

		const belowItemId = getIndexFromItem(collection, id, 1);

		if (!belowItemId) {
			return;
		}

		collection[index + 1] = id;
		collection[index] = belowItemId;
	},

	[up.type]: (state: State, action: UpArguments) => {
		const { id, collection } = getItemFromPath(state.item, state.path);
		let aboveItemId = getIndexFromItem(collection, id, -1);

		if (!aboveItemId) {
			// select the parent
			state.path.pop();
			return;
		}

		state.path.pop();
		state.path.push(aboveItemId);

		const maxIterations = 100;

		let item = state.item[aboveItemId];
		let iteration = 1;

		while (
			item &&
			item.children.length > 0 &&
			state.expanded.includes(getPathId(state.path)) &&
			iteration < maxIterations
		) {
			const lastChildId = getIndex(item.children, -1);
			state.path.push(lastChildId);
			item = state.item[lastChildId];
			iteration++;
		}

		if (iteration === maxIterations) {
			console.error("maximum iterations reached for 'up'");
		}
	},

	[down.type]: (state: State, action: DownArguments) => {
		let item = getItemFromPath(state.item, state.path);

		// check children
		if (
			item.children.length > 0 &&
			state.expanded.includes(getPathId(state.path))
		) {
			state.path.push(item.children[0]);
			return;
		}

		// check siblings
		let belowItemId = getIndexFromItem(item.collection, item.id, 1);

		// check parents
		while (!belowItemId && state.path.length > 1) {
			state.path.pop();
			item = getItemFromPath(state.item, state.path);
			belowItemId = getIndexFromItem(item.collection, item.id, 1);
		}

		state.path.pop();
		state.path.push(belowItemId);
	},

	[expand.type]: (state: State, action: PayloadAction<ExpandArguments>) => {
		const pathId = getPathId(action.payload.path);
		const expandedSet = new Set(state.expanded);
		expandedSet.add(pathId);
		state.expanded = Array.from(expandedSet);
	},

	[collapse.type]: (state: State, action: PayloadAction<CollapseArguments>) => {
		const pathId = getPathId(action.payload.path);
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

export function getPathId(path: string[]): string {
	return path.join(",");
}
