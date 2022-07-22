import React, { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { Button, ThemeProvider } from "theme-ui";
import { configureStore } from "@reduxjs/toolkit";

import theme from "../WebViewer/theme";
import { load, reducer } from "./duck";
import { Viewer } from "../Viewer";

import cookingExample from "./examples/cookingExample.json";
import timelineExample from "./examples/timelineExample.json";
import youtubeExample from "./examples/youtube.json";
import fileExample from "./examples/file-example.json";
import { FileWithName } from "./ToolbarUploadButton";

const store = configureStore({
	reducer,
});

// @ts-ignore
window.store = store;

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

export const VeryNestedTimeline = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: timelineExample }));
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

export const VeryNestedFilesAndUploader = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data: fileExample }));
	}, []);

	const handleUpload = async ({ name, base64 }: FileWithName) => {
		console.log("name: " + name);
		console.log("base64: ");
		console.log(base64);
		await timeout(2000);
		return "./files/Screen Shot 2020-07-11 at 9.42.39 am.png";
	};

	return <Viewer onUpload={handleUpload} baseUrl="/baseFolder" />;
};

export const VeryNestedRerenderFocusTest = () => {
	const [counter, setCounter] = useState(0);

	const handleClick = () => {
		setCounter(counter + 1);
	};

	const baseUrl = "baseUrl";

	return (
		<div>
			<p>Counter: {counter}</p>
			<button onClick={handleClick}>Increment</button>
			<p>clicking increment should make the selected item's input lose focus</p>
			<Viewer baseUrl={baseUrl} />
		</div>
	);
};
