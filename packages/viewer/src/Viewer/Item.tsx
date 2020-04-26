import React, { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editItem, select, processState } from "./duck";

export interface ItemProps {
	path: Array<string>;
}

const Item = ({ path }: ItemProps) => {
	const id = path.slice(-1)[0];

	const dispatch = useDispatch();

	const item = useSelector((state: any) => state.item[id]);
	const globalPath = useSelector((state: any) => state.path);

	const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		dispatch(editItem({ id, content: evt.target.value }));
	};
	const handleClick = () => {
		dispatch(select({ id, path }));
	};
	const handleBlur = () => {
		dispatch(processState());
	};
	const handleFocus = () => {
		dispatch(processState());
	};
	return (
		<li>
			{globalPath.join() === path.join() ? (
				<Fragment>
					<input
						value={item.content}
						onChange={handleChange}
						onBlur={handleBlur}
						onFocus={handleFocus} // not entirely sure why we need this
						autoFocus
						style={{ fontSize: "1rem" }}
					/>
					<span> - {item.error || id}</span>
				</Fragment>
			) : (
				<span
					onClick={handleClick}
					style={{ color: item.content.startsWith("calculation: ") && "green" }}
				>
					{item.content}
				</span>
			)}
			{item.children && path.filter(pathId => pathId === id).length < 2 && (
				<ul style={{ paddingLeft: "1.5rem" }}>
					{item.children.map((id: string) => (
						<Item key={id} path={[...path, id]} />
					))}
				</ul>
			)}
		</li>
	);
};

export default Item;
