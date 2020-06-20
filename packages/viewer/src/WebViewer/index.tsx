/** @jsx jsx */
import { jsx } from "theme-ui";
import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";
import { Viewer } from "Viewer";
import { load, reducer } from "Viewer/duck";
import { usePromise } from "@cadbox1/use-promise";
import { ThemeProvider, Container, Styled } from "theme-ui";
import theme from "./theme";

export interface WebViewerProps {
	url: string;
	showBanner?: boolean;
}

const store = configureStore({
	reducer,
});

const WebViewerInside = ({ url, showBanner }: WebViewerProps) => {
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
			{showBanner && (
				<div sx={{ fontSize: 1, marginBottom: 4 }}>
					Made with{" "}
					<Styled.a
						href="https://verynested.cadell.dev"
						target="_blank"
						rel="noopener noreferrer"
					>
						Very Nested
					</Styled.a>
				</div>
			)}
			{request.pending ? (
				"Loading..."
			) : request.rejected ? (
				"There was an error loading this page. Please refresh to try again."
			) : (
				<Viewer readonly />
			)}
		</div>
	);
};

export const WebViewer = ({ url, showBanner = true }: WebViewerProps) => {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<Container>
					<WebViewerInside url={url} showBanner={showBanner} />
				</Container>
			</ThemeProvider>
		</Provider>
	);
};
