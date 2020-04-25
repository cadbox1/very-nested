import React from "react";
import { Fragment } from "react";
import { useDispatch } from "react-redux";
import { HotKeys } from "react-hotkeys";
import {
	IoIosArrowRoundBack,
	IoIosArrowRoundForward,
	IoIosArrowRoundUp,
	IoIosArrowRoundDown,
	IoIosArrowUp,
	IoIosArrowDown,
} from "react-icons/io";
import Item from "./Item";
import {
	up,
	down,
	indent,
	undent,
	addItem,
	backspace,
	moveUp,
	moveDown,
} from "./duck";
import { ToolbarButton } from "./ToolbarButton";

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
	const handleMoveUp = preventDefault(() => dispatch(moveUp()));
	const handleMoveDown = preventDefault(() => dispatch(moveDown()));
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
					moveUp: "alt+up",
					moveDown: "alt+down",
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
						moveUp: handleMoveUp,
						moveDown: handleMoveDown,
						enter: handleEnter,
						backspace: handleBackspace,
					}}
				>
					<ul>
						<Item path={["vLlFS3csq"]} />
					</ul>
					<div style={{ position: "fixed", bottom: 0 }}>
						<div style={{ display: "flex" }}>
							<ToolbarButton
								onClick={() => dispatch(undent())}
								title="indent (tab)"
							>
								<IoIosArrowRoundBack />
							</ToolbarButton>
							<ToolbarButton
								onClick={() => dispatch(indent())}
								title="undent (shift + tab)"
							>
								<IoIosArrowRoundForward />
							</ToolbarButton>
							<ToolbarButton>
								<IoIosArrowRoundUp
									onClick={() => dispatch(moveUp())}
									title="move up (alt + upkey)"
								/>
							</ToolbarButton>
							<ToolbarButton>
								<IoIosArrowRoundDown
									onClick={() => dispatch(moveDown())}
									title="move down (alt + downkey)"
								/>
							</ToolbarButton>
							<ToolbarButton
								onClick={() => dispatch(up())}
								title="previous item (upkey)"
							>
								<IoIosArrowUp />
							</ToolbarButton>
							<ToolbarButton
								onClick={() => dispatch(down())}
								title="next item (downkey)"
							>
								<IoIosArrowDown />
							</ToolbarButton>
						</div>
					</div>
				</HotKeys>
			</HotKeys>
		</Fragment>
	);
};
