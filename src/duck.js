import uuidv4 from "uuid/v4";

export const ADD_ITEM = "ADD_ITEM";
export const EDIT_ITEM = "EDIT_ITEM";
export const UP = "UP";
export const DOWN = "DOWN";
export const INDENT = "INDENT";
export const UNDENT = "UNDENT";

const initialState = () => {
  const rootId = uuidv4();
  const firstChildId = uuidv4();
  return {
    path: [rootId, firstChildId],
    item: {
      [rootId]: { content: "Notes", children: [firstChildId] },
      [firstChildId]: { content: "firstNote" }
    }
  };
};

const itemReducer = (state, action, globalState) => {
  switch (action.type) {
    case ADD_ITEM: {
      const { afterId, parentId } = action.payload;
      const parent = state[parentId];
      const children = parent.children;
      const insertIndex = children.findIndex(child => child === afterId) + 1;
      const newId = uuidv4();
      return {
        ...state,
        ...{
          [parentId]: {
            ...parent,
            children: children
              .slice(0, insertIndex)
              .concat([newId], children.slice(insertIndex))
          }
        },
        ...{ [newId]: { content: "" } }
      };
    }
    case EDIT_ITEM: {
      const { id, content } = action.payload;
      return { ...state, [id]: { content } };
    }
    default:
      return state;
  }
};

const pathReducer = (state, action, globalState) => {
  switch (action.type) {
    case UP: {
      return state;
    }
    case DOWN: {
      return state;
    }
    default:
      return state;
  }
};

// effectively a custom combineReducer to pass in global state as well
// https://github.com/reduxjs/redux/pull/2795
export default (state = initialState(), action) => ({
  item: itemReducer(state.item, action, state),
  path: pathReducer(state.path, action, state)
});

export const addItem = ({ parentId, afterId, content }) => ({
  type: ADD_ITEM,
  payload: { parentId, afterId, content }
});

export const editItem = ({ id, content }) => ({
  type: EDIT_ITEM,
  payload: { id, content }
});

export const up = () => ({ type: UP });
export const down = () => ({ type: DOWN });
export const indent = () => ({ type: INDENT });
export const undent = () => ({ type: UNDENT });
