import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Viewer, load, reducer } from "very-nested-viewer";

const store = configureStore({
	reducer,
});

const InsideProvider = ({ data }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data }));
	}, []);

	return <Viewer readonly />;
};

export const ViewerContainer = ({ data }) => {
	return (
		<Provider store={store}>
			<InsideProvider data={data} />
		</Provider>
	);
};
