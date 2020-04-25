import produce from "immer";
import shortid from "shortid";
import { debounce } from "debounce";

import emptyState from "./emptyState.json";

export const LOAD = "LOAD";
export const ADD = "ADD";
export const EDIT = "EDIT";
export const BACKSPACE = "BACKSPACE";
export const INDENT = "INDENT";
export const UNDENT = "UNDENT";
export const MOVE_UP = "MOVE_UP";
export const MOVE_DOWN = "MOVE_DOWN";
export const UP = "UP";
export const DOWN = "DOWN";
export const SELECT = "SELECT";
export const RECORD_CHANGE = "RECORD_CHANGE";
export const CALCULATION = "CALCULATION";

export const load = ({ data }: { data: any }) => ({
	type: LOAD,
	payload: data,
});
export const backspace = () => ({ type: BACKSPACE });
export const up = () => ({ type: UP });
export const down = () => ({ type: DOWN });
export const indent = () => ({ type: INDENT });
export const undent = () => ({ type: UNDENT });
export const moveUp = () => ({ type: MOVE_UP });
export const moveDown = () => ({ type: MOVE_DOWN });
export const select = ({ id, path }: { id: string; path: string[] }) => ({
	type: SELECT,
	payload: { id, path },
});

export const addItem = () => ({ type: ADD });

export const editItem = ({ id, content }: { id: string; content: string }) => (
	dispatch: (action: any) => void,
	getState: any
) => {
	dispatch({
		type: EDIT,
		payload: { content },
	});
	if (content.startsWith("calculation: ")) {
		dispatch({
			type: CALCULATION,
			payload: { id },
		});
	}
};

// @ts-ignore
const debouncedProcessState = debounce((dispatch, getState) => {
	const state = getState();
	Object.keys(state.item)
		.map(id => state.item[id])
		.filter(item => item.content.startsWith("calculation: "))
		.forEach(item =>
			dispatch({
				type: CALCULATION,
				payload: { id: item.id },
			})
		);
}, 500);

// @ts-ignore
export const processState = () => (dispatch, getState) => {
	debouncedProcessState(dispatch, getState);
};

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

export const reducer = (state: State = emptyState, action: any) =>
	produce(state, (draft: State) => {
		const translator = new Translator(draft);
		switch (action.type) {
			case LOAD: {
				draft.path = [];
				draft.item = action.payload;
				break;
			}
			case ADD: {
				// create item
				const newId = shortid.generate();
				draft.item[newId] = {
					id: newId,
					content: "",
					children: [],
				};

				// insert new item into children below current item
				const currentItem = translator.getCurrentItem();
				const children = translator.getParent(currentItem.id).children;
				const insertIndex = children.indexOf(currentItem.id) + 1;
				children.splice(insertIndex, 0, newId);

				// select new item
				draft.path.pop();
				draft.path.push(newId);
				break;
			}
			case EDIT: {
				const { content } = action.payload;
				const currentItem = translator.getCurrentItem();

				// check if the content is an id
				if (Object.keys(draft.item).includes(content)) {
					// content is an id - replace the current item with a link to the id
					const newId = content;
					replaceAllReferencesToId(currentItem.id, newId, draft);
					deleteItem(currentItem.id, draft);
				} else {
					const item = translator.getCurrentItem();
					item.content = content;
				}

				break;
			}
			case BACKSPACE: {
				const currentItem = translator.getCurrentItem();
				if (currentItem.content === "") {
					// delete the item

					// select previous line item
					const previousLineItem =
						translator.getAboveItem(currentItem.id) ||
						translator.getParent(currentItem.id);
					draft.path.pop();
					draft.path.push(previousLineItem.id);

					// it would be cool if this was automatic somehow
					removeAllReferencesToId(currentItem.id, draft);

					deleteItem(currentItem.id, draft);
				}
				break;
			}

			case INDENT: {
				const target = translator.getCurrentItem();
				const currentParent = translator.getParent(target.id);
				const newParent = translator.getAboveItem(target.id);

				// remove target from parent
				const targetIndex = currentParent.children.indexOf(target.id);
				currentParent.children.splice(targetIndex, 1);

				// add to new parent
				newParent.children.push(target.id);

				// select new path
				draft.path.pop();
				draft.path.push(newParent.id, target.id);

				break;
			}
			case UNDENT: {
				const target = translator.getCurrentItem();
				const currentParent = translator.getParent(target.id);
				const newParent = translator.getParent(currentParent.id);

				// remove target from current parent
				const targetIndex = currentParent.children.indexOf(target.id);
				currentParent.children.splice(targetIndex, 1);

				// add to the new parent
				const currentParentIndex = newParent.children.indexOf(currentParent.id);
				newParent.children.splice(currentParentIndex + 1, 0, target.id);

				// select the new path
				draft.path.splice(-2, 1);

				break;
			}
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
			case SELECT: {
				const { path } = action.payload;
				draft.path = path;

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
