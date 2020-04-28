import produce from "immer";
import shortid from "shortid";
import { debounce } from "debounce";

import emptyState from "./emptyState.json";
import { createAction, createReducer, PayloadAction } from "@reduxjs/toolkit";
import {
	getIndex,
	insertAfter,
	getIndexFromItem,
	removeItemFromArray,
} from "./array-util";

export const INDENT = "INDENT";
export const UNDENT = "UNDENT";
export const MOVE_UP = "MOVE_UP";
export const MOVE_DOWN = "MOVE_DOWN";
export const UP = "UP";
export const DOWN = "DOWN";
export const RECORD_CHANGE = "RECORD_CHANGE";
export const CALCULATION = "CALCULATION";

export const up = () => ({ type: UP });
export const down = () => ({ type: DOWN });

export const moveUp = () => ({ type: MOVE_UP });
export const moveDown = () => ({ type: MOVE_DOWN });

type LoadArguments = {
	data: ItemStore;
};
export const load = createAction<LoadArguments>("LOAD");

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
	path: string[];
	item: ItemStore;
};

export const reducer = createReducer(emptyState, {
	[load.type]: (state: State, action: PayloadAction<LoadArguments>) => {
		state.path = [];
		state.item = action.payload.data;
	},
	[selectItem.type]: (state: State, action: any) => {
		state.path = action.payload.path;
	},
	[editItem.type]: (state: State, action: any) => {
		const { id, content } = action.payload;

		if (Object.keys(state.item).includes(content)) {
			// content is an id, replace it with a reference to the existing item.
			const referencedItemId = content;
			replaceAllReferencesToId(id, referencedItemId, state);
			deleteItem(id, state);
		} else {
			const item = state.item[id];
			item.content = content;
		}
	},
	[addItem.type]: (state: State, action: any) => {
		const { id, afterPath, content, children } = action.payload;

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
		state.path.pop();
		if (aboveItemId) {
			state.path.push(aboveItemId);
		}
	},
	[indentItem.type]: (state: State, action: IndentItemArguments) => {
		const { id, parentId, collection } = getItemFromPath(
			state.item,
			state.path
		);

		const newParentId = getIndexFromItem(collection, id, -1);
		if (!newParentId) {
			return;
		}

		const newParent = state.item[newParentId];
		newParent.children.push(id);

		state.path.pop();
		state.path.push(newParentId, id);

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
});

const oldReducer = (state: State = emptyState, action: any) =>
	produce(state, (draft: State) => {
		const translator = new Translator(draft);
		switch (action.type) {
			case MOVE_UP: {
				const target = translator.getCurrentItem();
				const parent = translator.getParent(target.id);

				const currentIndex = parent.children.indexOf(target.id);

				if (currentIndex === 0) {
					break;
				}

				const aboveIndex = currentIndex - 1;
				const aboveItemId = parent.children[aboveIndex];

				parent.children[currentIndex] = aboveItemId;
				parent.children[aboveIndex] = target.id;

				break;
			}
			case MOVE_DOWN: {
				const target = translator.getCurrentItem();
				const parent = translator.getParent(target.id);

				const currentIndex = parent.children.indexOf(target.id);

				if (currentIndex === parent.children.length - 1) {
					break;
				}

				const belowIndex = currentIndex + 1;
				const belowItemId = parent.children[belowIndex];

				parent.children[currentIndex] = belowItemId;
				parent.children[belowIndex] = target.id;

				break;
			}
			case UP: {
				const currentItem = translator.getCurrentItem();
				const aboveItem = translator.getAboveItem(currentItem.id);
				draft.path.pop();

				if (aboveItem != null) {
					draft.path.push(aboveItem.id);

					let children = aboveItem.children;
					while (children.length > 0) {
						const lastChildId = children.slice(-1)[0];
						draft.path.push(lastChildId);

						const lastChild = translator._getItemById(lastChildId);
						children = lastChild.children;
					}
				}

				break;
			}
			case DOWN: {
				const currentItem = translator.getCurrentItem();

				if (currentItem.children.length > 0) {
					draft.path.push(currentItem.children[0]);
				} else {
					let belowItem = translator.getBelowItem(currentItem.id);
					while (belowItem == null) {
						const parent = translator.getParent(currentItem.id);
						belowItem = translator.getBelowItem(parent.id);
						draft.path.pop();
					}
					draft.path.pop();
					draft.path.push(belowItem.id);
				}

				break;
			}

			case CALCULATION: {
				const { id } = action.payload;
				const item = translator._getItemById(id);
				const parent = translator.getParent(item.id);

				const calculation = item.content.replace("calculation: ", "");

				try {
					// (items, parent) => // [filteredItems]
					// filteredItem = {(id), (content)}
					const items = Object.keys(draft.item).map(
						itemId => new EnhancedItem(itemId, draft.item)
					);

					// eslint-disable-next-line
					const resultsFunction = eval(calculation);
					const results = resultsFunction(items, parent);
					item.children = results.map((result: EnhancedItem) => result.id);
				} catch (e) {
					item.error = e.message;
				}
				break;
			}
			default:
		}
	});

class EnhancedItem {
	id: string;
	itemStore: ItemStore;
	itemState: ItemState;

	constructor(id: string, itemStore: ItemStore) {
		this.id = id;
		this.itemStore = itemStore;

		this.itemState = itemStore[id];
	}

	get content() {
		return this.itemState.content;
	}

	get children() {
		return this.itemState.children
			.filter(childId => !!childId)
			.map(childId => new EnhancedItem(childId, this.itemStore));
	}
}

// These are the happy methods
class Translator {
	state: State;

	constructor(draft: State) {
		this.state = draft;
	}

	getCurrentItem = () => {
		const currentId = this._getCurrentId();
		return this._getItemById(currentId);
	};

	getParent = (id: string) => {
		const parentId = this._getParentId(id);
		return this._getItemById(parentId);
	};

	getAboveItem = (id: string) => {
		return this._getAboveItems(id)[0];
	};

	getBelowItem = (id: string) => {
		return this._getBelowItems(id)[0];
	};

	// these are the lower-level, private methods
	_getItemById = (id: string) => {
		return this.state.item[id];
	};

	_getCurrentId = () => {
		return [...this.state.path].reverse()[0];
	};

	_getAncestorIds = (id: string) => {
		const reversedPath = [...this.state.path].reverse();
		const indexOfId = reversedPath.indexOf(id);
		// return everything in the path after the id
		return reversedPath.slice(indexOfId + 1);
	};

	_getParentId = (id: string) => {
		return this._getAncestorIds(id)[0];
	};

	_getAboveItems = (id: string) => {
		const parent = this.getParent(id);
		const currentIndex = parent.children.indexOf(id);
		const getAboveItemIds = parent.children.slice(0, currentIndex).reverse();
		return getAboveItemIds.map(id => this._getItemById(id));
	};

	_getBelowItems = (id: string) => {
		const parent = this.getParent(id);
		const currentIndex = parent.children.indexOf(id);
		const getBelowItemIds = [...parent.children].slice(currentIndex + 1);
		return getBelowItemIds.map(id => this._getItemById(id));
	};
}

function getItemFromPath(
	itemStore: ItemStore,
	path: string[]
): {
	id: string;
	parentId: string;
	parentsParentId: string;
	collection: string[];
} {
	const id = getIndex(path, -1);
	const parentId = getIndex(path, -2);
	const parentsParentId = getIndex(path, -3);

	const collection = getCollection(itemStore, parentId);

	return { id, parentId, parentsParentId, collection };
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
