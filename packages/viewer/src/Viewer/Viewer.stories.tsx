import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import cookingExample from "./cookingExample.json";
import youtubeExample from "./youtube.json";

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

export const VeryNestedCookingReadonly = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: cookingExample }));
	}, []);

	return <Viewer readonly />;
};

export const VeryNestedCookingReadonlyWithBanner = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: cookingExample }));
	}, []);

	return <Viewer readonly showBanner />;
};

export const VeryNestedYoutube = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: youtubeExample }));
	}, []);

	return <Viewer />;
};
