import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

import cookingExample from "./cookingExample.json";
import { load, reducer } from "./duck";
import { Viewer } from "../Viewer";

const store = configureStore({
	reducer,
});

const providerDecorator = (StoryFn: any) => (
	<Provider store={store}>
		<StoryFn />
	</Provider>
);

export default {
	title: "Viewer",
	component: Viewer,
	decorators: [providerDecorator],
};

export const VeryNestedCooking = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: cookingExample }));
	}, []);

	return <Viewer />;
};
