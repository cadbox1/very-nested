import React from "react";
import ReactDOM from "react-dom";
import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

import App from "./App";
import item from "./duck";
import registerServiceWorker from "./registerServiceWorker";

const rootReducer = combineReducers({ item });

function configureStore() {
  return createStore(
    rootReducer,
    compose(
      applyMiddleware(thunk),
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  );
}

ReactDOM.render(
  <Provider store={configureStore()}>
    <App />
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
