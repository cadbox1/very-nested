import React from "react";
import ReactDOM from "react-dom";
import { applyMiddleware, compose, createStore } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";

import "bootstrap/dist/css/bootstrap-reboot.css";

import App from "./App";
import reducer from "./duck";
import * as serviceWorker from "./serviceWorker";

// dirty hack https://github.com/rt2zz/redux-persist/issues/747#issuecomment-425126732
import { setAutoFreeze } from "immer";
setAutoFreeze(false);

const persistedReducer = persistReducer(
	{
		key: "root",
		storage,
	},
	reducer
);

let persistor;

function configureStore() {
	const composeEnhancers =
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
	const store = createStore(
		persistedReducer,
		composeEnhancers(applyMiddleware(thunk))
	);
	persistor = persistStore(store);
	return store;
}

ReactDOM.render(
	<Provider store={configureStore()}>
		<PersistGate loading={null} persistor={persistor}>
			<App />
		</PersistGate>
	</Provider>,
	document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
