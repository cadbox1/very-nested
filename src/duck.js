import produce from "immer";
import uuidv4 from "uuid/v4";

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

export const editItem = ({ content }) => (dispatch, getState) => {
	dispatch({
		type: EDIT,
		payload: { content },
	});
	if (content.startsWith("calculation: ")) {
		dispatch({
			type: CALCULATION,
			payload: { calculation: content.replace("calculation: ", "") },
		});
	}
};

const initialState = () => {
	const rootId = uuidv4();
	const firstChildId = uuidv4();
	return {
		path: [rootId, firstChildId],
		item: {
			[rootId]: {
				id: rootId,
				content: "Notes",
				properties: {},
				children: [firstChildId],
			},
			[firstChildId]: {
				id: firstChildId,
				content: "",
				properties: {},
				children: [],
			},
		},
		activity: []
	};
};

export default (state = initialState(), action) =>
	produce(state, draft => {
		const translator = new Translator(draft);
		switch (action.type) {
			case ADD: {
				// create item
				const newId = uuidv4();
				draft.item[newId] = {
					id: newId,
					content: "",
					properties: {},
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

					// handle activity
					const activityLog = {
						name: "content update",
						content: item.content,
						affectedId: item.id,
						date: new Date(),
					}

					const latestActivity = draft.activity[draft.activity.length - 1];
					if (latestActivity && latestActivity.affectedId === item.id) {
						latestActivity.date = activityLog.date;
						latestActivity.content = activityLog.content;
					} else {
						draft.activity.push(activityLog)
					}
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
				const { calculation } = action.payload;
				const item = translator.getCurrentItem();
				const parent = translator.getParent(item.id);
				try {
					// (items, parent) => // [filteredItems]
					// filteredItem = {(id), (content)}
					const items = Object.keys(draft.item).map(key => draft.item[key]);
					// eslint-disable-next-line
					const resultsFunction = eval(calculation);
					const results = resultsFunction(items, parent);
					item.children = results.map(result => result.id);
					// (items, parent) => items.filter(item => item.properties.type == "task")
				} catch (e) {
					item.error = e.message;
				}
				break;
			}
			default:
		}
	});

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
