import React from "react";
import { Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HotKeys } from "react-hotkeys";
import {
	IoIosArrowRoundBack,
	IoIosArrowRoundForward,
	IoIosArrowRoundUp,
	IoIosArrowRoundDown,
	IoIosArrowUp,
	IoIosArrowDown,
	IoIosTrash,
} from "react-icons/io";
import Item from "./Item";
import {
	up,
	down,
	indent,
	undent,
	addItem,
	removeItem,
	moveUp,
	moveDown,
} from "./duck";
import { ToolbarButton } from "./ToolbarButton";
import { last } from "./array-util";

function objectMap<T = any>(
	obj: {},
	fn: ({ key, value, index }: { key: {}; value: any; index: number }) => T
) {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value], index) => [
			key,
			fn({ key, value, index }),
		])
	);
}

export const Viewer = () => {
	const dispatch = useDispatch();
	const selectedPath = useSelector((state: any) => state.path);
	const id = last(selectedPath);
	const selectedItem = useSelector((state: any) => state.item[id]);

	const actions = {
		up,
		down,
		indent,
		undent,
		moveUp,
		moveDown,
		enter: () => addItem({ afterPath: selectedPath }),
	};

	const preparedHandlers = objectMap<(evt?: KeyboardEvent) => void>(
		actions,
		({ value: handler }) => (evt?: KeyboardEvent) => {
			if (evt) {
				evt.preventDefault();
			}
			dispatch(handler());
		}
	);

	const handleRemove = () => {
		dispatch(removeItem({ path: selectedPath }));
	};

	const handlers = {
		...preparedHandlers,
		backspace: () => {
			if (selectedItem.content === "") {
				handleRemove();
			}
		},
	};

	return (
		<Fragment>
			<HotKeys
				keyMap={{
					up: "up",
					down: "down",
					indent: "tab",
					undent: "shift+tab",
					moveUp: "alt+up",
					moveDown: "alt+down",
					enter: "enter",
					backspace: "backspace",
				}}
			>
				<HotKeys handlers={handlers}>
					<ul>
						<Item path={["vLlFS3csq"]} />
					</ul>
					<div style={{ position: "fixed", bottom: 0 }}>
						<div style={{ display: "flex" }}>
							<ToolbarButton
								onClick={preparedHandlers.undent}
								title="undent (shift + tab)"
							>
								<IoIosArrowRoundBack />
							</ToolbarButton>
							<ToolbarButton
								onClick={preparedHandlers.indent}
								title="indent (tab)"
							>
								<IoIosArrowRoundForward />
							</ToolbarButton>
							<ToolbarButton
								onClick={preparedHandlers.moveUp}
								title="move up (alt + upkey)"
							>
								<IoIosArrowRoundUp />
							</ToolbarButton>
							<ToolbarButton
								onClick={preparedHandlers.moveDown}
								title="move down (alt + downkey)"
							>
								<IoIosArrowRoundDown />
							</ToolbarButton>
							<ToolbarButton
								onClick={preparedHandlers.up}
								title="previous item (upkey)"
							>
								<IoIosArrowUp />
							</ToolbarButton>
							<ToolbarButton
								onClick={preparedHandlers.down}
								title="next item (downkey)"
							>
								<IoIosArrowDown />
							</ToolbarButton>
							<ToolbarButton onClick={handleRemove} title="remove item">
								<IoIosTrash />
							</ToolbarButton>
						</div>
					</div>
				</HotKeys>
			</HotKeys>
		</Fragment>
	);
};
