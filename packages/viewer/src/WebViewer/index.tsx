import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { Viewer } from "Viewer";
import { load, reducer } from "Viewer/duck";
import { usePromise } from "@cadbox1/use-promise";

export interface WebViewerProps {
	url: string;
}

const store = configureStore({
	reducer,
});

const WebViewerInside = ({ url }: WebViewerProps) => {
	const dispatch = useDispatch();
	const request = usePromise({
		promiseFunction: async () => {
			const response = await axios.get(url);
			dispatch(load({ data: response.data }));
		},
	});

	useEffect(() => {
		request.call();
	}, [url]);

	return (
		<div>
			{request.pending ? (
				"Loading..."
			) : request.rejected ? (
				"There was an error loading this page. Please refresh to try again."
			) : (
				<Viewer readonly showBanner />
			)}
		</div>
	);
};

export const WebViewer = ({ url }: WebViewerProps) => {
	return (
		<Provider store={store}>
			<WebViewerInside url={url} />
		</Provider>
	);
};
