import uuidv4 from "uuid/v4";

export const ADD_ITEM = "ADD_ITEM";
export const EDIT_ITEM = "EDIT_ITEM";

const initialState = () => {
  const firstChildId = uuidv4();
  return {
    root: { content: "Notes", children: [firstChildId] },
    [firstChildId]: { content: "firstNote" }
  };
};

export default (state = initialState(), action) => {
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

export const addItem = ({ parentId, afterId, content }) => ({
  type: ADD_ITEM,
  payload: { parentId, afterId, content }
});

export const editItem = ({ id, content }) => ({
  type: EDIT_ITEM,
  payload: { id, content }
});
