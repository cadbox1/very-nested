import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { Viewer, load, reducer } from "very-nested-viewer";

const store = configureStore({
	reducer,
});

const InsideProvider = ({
	data,
	readonly,
}: {
	data: any;
	readonly: boolean;
}) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(load({ data }));
	}, []);

	return <Viewer readonly={readonly} />;
};

export const ViewerContainer = ({
	data,
	readonly = true,
}: {
	data: any;
	readonly?: boolean;
}) => {
	return (
		<Provider store={store}>
			<InsideProvider data={data} readonly={readonly} />
		</Provider>
	);
};
