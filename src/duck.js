import produce from "immer";
import uuidv4 from "uuid/v4";

export const ADD = "ADD";
export const EDIT = "EDIT";
export const CALCULATION = "CALCULATION";
export const BACKSPACE = "BACKSPACE";
export const INDENT = "INDENT";
export const UNDENT = "UNDENT";
export const UP = "UP";
export const DOWN = "DOWN";
export const SELECT = "SELECT";

const getItemById = (id, state) => {
	return state.item[id];
};
const getAncestorIds = (id, state) => {
	const reversedPath = [...state.path].reverse();
	const indexOfId = reversedPath.indexOf(id);
	// return everything in the path after the id
	return reversedPath.slice(indexOfId + 1);
};

const getCurrentId = state => {
	return [...state.path].reverse()[0];
};
const getCurrentItem = state => {
	return getItemById(getCurrentId(state), state);
};
const getParentId = (id, state) => {
	return getAncestorIds(id, state)[0];
};
const getParent = (id, state) => {
	return getItemById(getParentId(id, state), state);
};
const getAboveItemIds = (id, state) => {
	const parent = getParent(id, state);
	const currentIndex = parent.children.indexOf(id);
	return parent.children.slice(0, currentIndex).reverse();
};
const getAboveItem = (id, state) => {
	const aboveItemId = getAboveItemIds(id, state)[0];
	return aboveItemId ? getItemById(aboveItemId, state) : null;
};
const getBelowItemIds = (id, state) => {
	const parent = getParent(id, state);
	const currentIndex = parent.children.indexOf(id);
	return [...parent.children].slice(currentIndex + 1);
};
const getBelowItem = (id, state) => {
	const belowItemId = getBelowItemIds(id, state)[0];
	return belowItemId ? getItemById(belowItemId, state) : null;
};

const getAllItemsWithIdInChildren = (id, state, callback) => {
	Object.keys(state.item).forEach(itemId => {
		const item = state.item[itemId];
		if (item.children.includes(id)) {
			callback(item);
		}
	});
};

const replaceAllReferencesToId = (oldId, newId, state) => {
	getAllItemsWithIdInChildren(oldId, state, item => {
		item.children = item.children.map(childId =>
			childId === oldId ? newId : childId
		);
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

const initialState = () => {
	const rootId = uuidv4();
	const firstChildId = uuidv4();
	return {
		path: [rootId, firstChildId],
		item: {
			[rootId]: {
				id: rootId,
				content: "Root",
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
	};
};

export default (state = initialState(), action) =>
	produce(state, draft => {
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

				// insert into collection
				const currentId = getCurrentId(draft);
				const children = getParent(currentId, draft).children;
				const insertIndex = children.indexOf(currentId) + 1;
				children.splice(insertIndex, 0, newId);

				// select new item
				draft.path.pop();
				draft.path.push(newId);
				break;
			}
			case EDIT: {
				const { content } = action.payload;
				const id = getCurrentId(draft);

				if (Object.keys(draft.item).includes(content)) {
					// content is an id
					const newId = content;
					replaceAllReferencesToId(id, newId, draft);
					deleteItem(id, draft);
				} else {
					const item = getCurrentItem(draft);
					if (content.substring(0, content.indexOf(" ")).includes(":")) {
						// is a property
						const key = content.substring(0, content.indexOf(":"));
						const value = content.substring(content.indexOf(":") + 2);

						const parent = getParent(item.id, draft);
						parent.properties[key] = value;
					}
					// TODO: handle removing properties
					item.content = content;
				}

				break;
			}
			case CALCULATION: {
				const { calculation } = action.payload;
				const item = getCurrentItem(draft);
				const parent = getParent(item.id, draft);
				try {
					// (items, parent) => // [filteredItems]
					// filteredItem = {(id), (content)}
					const items = Object.keys(draft.item).map(key => draft.item[key]);
					const resultsFunction = eval(calculation);
					const results = resultsFunction(items, parent);
					item.children = results.map(result => result.id);
					// (items, parent) => items.filter(item => item.properties.type == "task")
				} catch (e) {
					item.error = e.message;
				}
				break;
			}
			case BACKSPACE: {
				const currentItem = getCurrentItem(draft);
				if (currentItem.content === "") {
					// delete the item

					// select previous line item
					const previousLineItem =
						getAboveItem(currentItem.id, state) ||
						getParent(currentItem.id, state);
					draft.path.pop();
					draft.path.push(previousLineItem.id);

					// it would be cool if this was automatic somehow
					removeAllReferencesToId(currentItem.id, draft);

					deleteItem(currentItem.id, draft);
				}
				break;
			}

			case INDENT: {
				const target = getCurrentItem(draft);
				const currentParent = getParent(target.id, draft);
				const newParent = getAboveItem(target.id, draft);

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
				const target = getCurrentItem(draft);
				const currentParent = getParent(target.id, draft);
				const newParent = getParent(currentParent.id, draft);

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
				const currentId = getCurrentId(draft);
				const aboveItem = getAboveItem(currentId, draft);
				draft.path.pop();

				if (aboveItem != null) {
					draft.path.push(aboveItem.id);

					let children = aboveItem.children;
					while (children.length > 0) {
						const lastChildId = children.slice(-1)[0];
						draft.path.push(lastChildId);

						const lastChild = getItemById(lastChildId, draft);
						children = lastChild.children;
					}
				}

				break;
			}
			case DOWN: {
				const currentItem = getCurrentItem(draft);

				if (currentItem.children.length > 0) {
					draft.path.push(currentItem.children[0]);
				} else {
					let belowItem = getBelowItem(currentItem.id, draft);
					while (belowItem == null) {
						const parent = getParent(currentItem.id, draft);
						belowItem = getBelowItem(parent.id, draft);
						draft.path.pop();
					}

					draft.path.push(belowItem.id);
				}

				break;
			}
			case SELECT: {
				const { path } = action.payload;
				draft.path = path;

				break;
			}
			default:
		}
	});

export const addItem = () => ({ type: ADD });

export const editItem = ({ content }) => (dispatch, getState) => {
	if (content.startsWith("calculation: ")) {
		dispatch({
			type: CALCULATION,
			payload: { calculation: content.replace("calculation: ", "") },
		});
	}
	dispatch({
		type: EDIT,
		payload: { content },
	});
};

export const backspace = () => ({ type: BACKSPACE });

export const up = () => ({ type: UP });
export const down = () => ({ type: DOWN });
export const indent = () => ({ type: INDENT });
export const undent = () => ({ type: UNDENT });

export const select = ({ id, path }) => ({
	type: SELECT,
	payload: { id, path },
});
