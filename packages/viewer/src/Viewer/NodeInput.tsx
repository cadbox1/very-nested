/** @jsx jsx */
import { jsx } from "theme-ui";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { editItem } from "./duck";

export interface NodeInputProps {
	nodeId: string;
	defaultValue: string;
}

export const NodeInput = ({ nodeId, defaultValue }: NodeInputProps) => {
	const dispatch = useDispatch();

	const [value, setValue] = useState(defaultValue);

	const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		setValue(evt.target.value);
	};

	const valueRef = useRef(value);

	useEffect(() => {
		valueRef.current = value;
	}, [value]);

	useEffect(() => {
		return () => {
			if (defaultValue !== valueRef.current) {
				dispatch(editItem({ nodeId, content: valueRef.current }));
			}
		};
	}, []);

	return (
		<input
			value={value}
			onChange={handleChange}
			sx={{
				font: "inherit",
				padding: 0,
				border: "none",
				outline: "none",
				width: "100%",
				position: "absolute",
				top: 0,
				left: 0,
			}}
			autoFocus
		/>
	);
};
