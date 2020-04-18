import React from "react";
import { Fragment } from "react";
import { useDispatch } from "react-redux";
import { HotKeys } from "react-hotkeys";
import Item from "./Item";
import { up, down, indent, undent, addItem, backspace } from "./duck";

const preventDefault = (func: (...args: any[]) => void) => (
	evt: KeyboardEvent | undefined
) => {
	if (evt) {
		evt.preventDefault();
	}
	func();
};

export const Viewer = () => {
	const dispatch = useDispatch();

	const handleUp = preventDefault(() => dispatch(up()));
	const handleDown = preventDefault(() => dispatch(down()));
	const handleIndent = preventDefault(() => dispatch(indent()));
	const handleUndent = preventDefault(() => dispatch(undent()));
	const handleEnter = preventDefault(() => dispatch(addItem()));
	const handleBackspace = () => dispatch(backspace());

	return (
		<Fragment>
			<HotKeys
				keyMap={{
					up: "up",
					down: "down",
					indent: "tab",
					undent: "shift+tab",
					enter: "enter",
					backspace: "backspace",
				}}
			>
				<HotKeys
					handlers={{
						up: handleUp,
						down: handleDown,
						indent: handleIndent,
						undent: handleUndent,
						enter: handleEnter,
						backspace: handleBackspace,
					}}
				>
					<ul>
						<Item path={["vLlFS3csq"]} />
					</ul>
				</HotKeys>
			</HotKeys>
		</Fragment>
	);
};
