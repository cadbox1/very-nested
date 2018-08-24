import produce from "immer";
import uuidv4 from "uuid/v4";

export const ADD = "ADD";
export const EDIT = "EDIT";
export const INDENT = "INDENT";
export const UNDENT = "UNDENT";
export const UP = "UP";
export const DOWN = "DOWN";
export const SELECT = "SELECT";

const initialState = () => {
  const rootId = uuidv4();
  const firstChildId = uuidv4();
  return {
    path: [rootId, firstChildId],
    item: {
      [rootId]: { content: "Notes", children: [firstChildId] },
      [firstChildId]: { content: "firstNote", children: [] }
    }
  };
};

export default (state = initialState(), action) =>
  produce(state, draft => {
    switch (action.type) {
      case ADD: {
        const [afterId, parentId] = [...draft.path].reverse();
        const parent = draft.item[parentId];
        const children = parent.children;
        const newId = uuidv4();
        const insertIndex = children.findIndex(value => value === afterId) + 1;

        children.splice(insertIndex, 0, newId);
        draft.item[newId] = { content: "", children: [] };

        draft.path.splice(-1, 1, newId);

        break;
      }
      case EDIT: {
        const { content } = action.payload;
        const id = draft.path.slice(-1)[0];
        draft.item[id].content = content;

        break;
      }
      case INDENT: {
        const [targetId, currentParentId] = [...draft.path].reverse();
        const currentParent = draft.item[currentParentId];
        const targetIndex = currentParent.children.findIndex(
          value => value === targetId
        );
        const newParentId = currentParent.children[targetIndex - 1];
        const newParent = draft.item[newParentId];
        const target = draft.item[targetId];

        currentParent.children.splice(targetIndex, 1);
        newParent.children.push(targetId, ...target.children);
        target.children = [];

        draft.path.splice(-1, 1);
        draft.path.push(newParentId, targetId);

        break;
      }
      case UNDENT: {
        const [targetId, currentParentId, newParentId] = [
          ...draft.path
        ].reverse();
        const currentParent = draft.item[currentParentId];
        const targetIndex = currentParent.children.findIndex(
          value => value === targetId
        );

        const newParent = draft.item[newParentId];
        const currentParentIndex = newParent.children.findIndex(
          value => value === currentParentId
        );

        currentParent.children.splice(targetIndex, 1);
        newParent.children.splice(currentParentIndex + 1, 0, targetId);

        const target = draft.item[targetId];
        target.children = currentParent.children.splice(targetIndex);

        draft.path.splice(-2, 1);

        break;
      }
      case UP: {
        const [beforeId, parentId] = [...draft.path].reverse();
        const parent = draft.item[parentId];
        const targetIndex =
          parent.children.findIndex(value => value === beforeId) - 1;
        const targetId = parent.children[targetIndex];

        draft.path.splice(-1, 1, targetId);

        break;
      }
      case DOWN: {
        const [afterId, parentId] = [...draft.path].reverse();
        const parent = draft.item[parentId];
        const targetIndex =
          parent.children.findIndex(value => value === afterId) + 1;
        const targetId = parent.children[targetIndex];

        draft.path.splice(-1, 1, targetId);

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

export const editItem = ({ content }) => ({
  type: EDIT,
  payload: { content }
});

export const select = ({ id, path }) => ({
  type: SELECT,
  payload: { id, path }
});

export const up = () => ({ type: UP });
export const down = () => ({ type: DOWN });
export const indent = () => ({ type: INDENT });
export const undent = () => ({ type: UNDENT });
