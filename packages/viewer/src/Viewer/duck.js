import produce from "immer";
import shortid from "shortid";
import { debounce } from "debounce";

import initialState from "./initialState.json";

export const LOAD = "LOAD";
export const ADD = "ADD";
export const EDIT = "EDIT";
export const BACKSPACE = "BACKSPACE";
export const INDENT = "INDENT";
export const UNDENT = "UNDENT";
export const UP = "UP";
export const DOWN = "DOWN";
export const SELECT = "SELECT";
export const RECORD_CHANGE = "RECORD_CHANGE";
export const CALCULATION = "CALCULATION";

export const load = ({ data }) => ({ type: LOAD, payload: data });
export const backspace = () => ({ type: BACKSPACE });
export const up = () => ({ type: UP });
export const down = () => ({ type: DOWN });
export const indent = () => ({ type: INDENT });
export const undent = () => ({ type: UNDENT });
export const select = ({ id, path }) => ({
	type: SELECT,
	payload: { id, path },
});

export const addItem = () => ({ type: ADD });

export const editItem = ({ id, content }) => (dispatch, getState) => {
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

export const processState = () => (dispatch, getState) => {
	debouncedProcessState(dispatch, getState);
};

export const reducer = (state = initialState, action) =>
	produce(state, draft => {
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
					const item = translator.getCurrentItem(draft);
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
						itemId => new Item(itemId, draft.item)
					);

					// eslint-disable-next-line
					const resultsFunction = eval(calculation);
					const results = resultsFunction(items, parent);
					item.children = results.map(result => result.id);
				} catch (e) {
					item.error = e.message;
				}
				break;
			}
			default:
		}
	});

class Item {
	constructor(id, itemStore) {
		this.id = id;
		this.itemStore = itemStore;

		this.item = itemStore[id];
	}

	get content() {
		return this.item.content;
	}

	get children() {
		return this.item.children
			.filter(childId => !!childId)
			.map(childId => new Item(childId, this.itemStore));
	}
}

// These are the happy methods
class Translator {
	constructor(draft) {
		this.state = draft;
	}

	getCurrentItem = () => {
		const currentId = this._getCurrentId();
		return this._getItemById(currentId);
	};

	getParent = id => {
		const parentId = this._getParentId(id);
		return this._getItemById(parentId);
	};

	getAboveItem = id => {
		return this._getAboveItems(id)[0];
	};

	getBelowItem = id => {
		return this._getBelowItems(id)[0];
	};

	// these are the lower-level, private methods
	_getItemById = id => {
		return this.state.item[id];
	};

	_getCurrentId = () => {
		return [...this.state.path].reverse()[0];
	};

	_getAncestorIds = id => {
		const reversedPath = [...this.state.path].reverse();
		const indexOfId = reversedPath.indexOf(id);
		// return everything in the path after the id
		return reversedPath.slice(indexOfId + 1);
	};

	_getParentId = id => {
		return this._getAncestorIds(id)[0];
	};

	_getAboveItems = id => {
		const parent = this.getParent(id);
		const currentIndex = parent.children.indexOf(id);
		const getAboveItemIds = parent.children.slice(0, currentIndex).reverse();
		return getAboveItemIds.map(id => this._getItemById(id));
	};

	_getBelowItems = id => {
		const parent = this.getParent(id);
		const currentIndex = parent.children.indexOf(id);
		const getBelowItemIds = [...parent.children].slice(currentIndex + 1);
		return getBelowItemIds.map(id => this._getItemById(id));
	};
}

const replaceAllReferencesToId = (oldId, newId, state) => {
	getAllItemsWithIdInChildren(oldId, state, item => {
		item.children = item.children.map(childId =>
			childId === oldId ? newId : childId
		);
	});
};

const getAllItemsWithIdInChildren = (id, state, callback) => {
	Object.keys(state.item).forEach(itemId => {
		const item = state.item[itemId];
		if (item.children.includes(id)) {
			callback(item);
		}
	});
};

const removeAllReferencesToId = (id, state) => {
	getAllItemsWithIdInChildren(id, state, item => {
		item.children = item.children.filter(childId => childId !== id);
	});
};

const deleteItem = (id, state) => {
	delete state.item[id];
};
