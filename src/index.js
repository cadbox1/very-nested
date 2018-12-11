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
import registerServiceWorker from "./registerServiceWorker";

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
	const store = createStore(
		persistedReducer,
		compose(
			applyMiddleware(thunk),
			window.__REDUX_DEVTOOLS_EXTENSION__ &&
				window.__REDUX_DEVTOOLS_EXTENSION__()
		)
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
registerServiceWorker();
