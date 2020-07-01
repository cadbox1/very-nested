import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { ThemeProvider } from "theme-ui";
import { configureStore } from "@reduxjs/toolkit";

import theme from "../WebViewer/theme";
import { load, reducer } from "./duck";
import { Viewer } from "../Viewer";

import cookingExample from "./examples/cookingExample.json";
import youtubeExample from "./examples/youtube.json";
import { FileWithName } from "./ToolbarUploadButton";

const store = configureStore({
	reducer,
});

const providerDecorator = (StoryFn: any) => (
	<Provider store={store}>
		<ThemeProvider theme={theme}>
			<StoryFn />
		</ThemeProvider>
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

export const VeryNestedYoutube = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: youtubeExample }));
	}, []);

	return <Viewer />;
};

function timeout(delay: number) {
	return new Promise(resolve => setTimeout(resolve, delay));
}

export const VeryNestedUploader = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: youtubeExample }));
	}, []);

	const handleUpload = async ({ name, base64 }: FileWithName) => {
		console.log("name: " + name);
		console.log("base64: ");
		console.log(base64);
		await timeout(2000);
		return "./fake-uri";
	};

	return <Viewer onUpload={handleUpload} baseUrl="https://some-address.com" />;
};
