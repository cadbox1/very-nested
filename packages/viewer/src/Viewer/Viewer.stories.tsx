import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import { reducer } from "./duck";
import { Viewer } from "../Viewer";

export default {
	title: "Viewer",
	component: Viewer,
};

const store = configureStore({
	reducer,
});

export const VeryNestedCooking = () => {
	return (
		<Provider store={store}>
			<Viewer />
		</Provider>
	);
};
