/** @jsx jsx */
import { jsx } from "theme-ui";
import { useEffect } from "react";
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
	IoIosCloudUpload,
} from "react-icons/io";
import Item from "./Item";
import {
	up,
	down,
	indentItem,
	undentItem,
	addItem,
	removeItem,
	moveUp,
	moveDown,
	setReadOnly,
	editItem,
	setBaseUrl,
} from "./duck";
import { ToolbarButton } from "./ToolbarButton";
import { last, objectMap } from "./array-util";
import { FixedToolbar } from "./FixedToolbar";
import { ToolbarUploadButton, FileWithName } from "./ToolbarUploadButton";

export interface ViewerProps {
	readonly?: boolean;
	onUpload?: (fileWithName: FileWithName) => Promise<string>;
	baseUrl?: string;
}

export const Viewer = ({
	readonly = false,
	baseUrl = "",
	onUpload,
}: ViewerProps) => {
	const dispatch = useDispatch();
	const selectedPath = useSelector((state: any) => state.path);
	const id = last(selectedPath);
	const selectedItem = useSelector((state: any) => state.item[id]);

	useEffect(() => {
		dispatch(setReadOnly({ readonly }));
	}, [dispatch, readonly]);

	useEffect(() => {
		dispatch(setBaseUrl({ baseUrl }));
	}, [dispatch, baseUrl]);

	const actions = {
		up,
		down,
		indent: indentItem,
		undent: undentItem,
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
		backspace: (evt?: KeyboardEvent) => {
			if (selectedItem.content === "") {
				if (evt) {
					evt.preventDefault();
				}
				handleRemove();
			}
		},
	};

	const handleUploadComplete = (uri: string) => {
		dispatch(editItem({ id, content: uri }));
	};

	return (
		<Fragment>
			<HotKeys
				tabIndex={undefined}
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
				<HotKeys tabIndex={undefined} handlers={handlers}>
					<div style={{ overflow: "auto", whiteSpace: "nowrap" }}>
						<ul
							style={{
								paddingLeft: 0,
								paddingBottom: "3rem",
								margin: 0,
							}}
						>
							<Item path={["vLlFS3csq"]} />
						</ul>
					</div>
					{selectedItem && (
						<FixedToolbar>
							<div
								sx={{
									display: "inline-block",
									backgroundColor: "background",
									borderStyle: "solid",
									borderWidth: "1px",
									borderColor: "muted",
								}}
							>
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
								{onUpload && (
									<ToolbarUploadButton
										onUpload={onUpload}
										onUploadComplete={handleUploadComplete}
										title="upload item"
									>
										<IoIosCloudUpload />
									</ToolbarUploadButton>
								)}
							</div>
						</FixedToolbar>
					)}
				</HotKeys>
			</HotKeys>
		</Fragment>
	);
};
