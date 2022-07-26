/** @jsx jsx */
import { jsx } from "theme-ui";
import { useEffect } from "react";
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
import Node from "./Node";
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
	ROOT_ID,
	State,
	getPathFromNodeId,
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
	const selectedNodeId = useSelector((state: State) => state.nodeId);
	const id = last(getPathFromNodeId(selectedNodeId));
	const selectedItem = useSelector((state: State) => state.item[id]);

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
		enter: () => addItem({ afterNodeId: selectedNodeId }),
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
		dispatch(removeItem());
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
		<div>
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
					<div
						style={{
							width: "100%",
							maxWidth: "800px",
							overflow: "auto",
						}}
					>
						<ul
							style={{
								paddingLeft: 0,
								paddingBottom: "3rem",
								margin: 0,
							}}
						>
							<Node nodeId={ROOT_ID} />
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
									onClick={() => {
										preparedHandlers.undent();
									}}
									title="undent (shift + tab)"
								>
									<IoIosArrowRoundBack />
								</ToolbarButton>
								<ToolbarButton
									onClick={() => {
										preparedHandlers.indent();
									}}
									title="indent (tab)"
								>
									<IoIosArrowRoundForward />
								</ToolbarButton>
								<ToolbarButton
									onClick={() => {
										preparedHandlers.moveUp();
									}}
									title="move up (alt + up)"
								>
									<IoIosArrowRoundUp />
								</ToolbarButton>
								<ToolbarButton
									onClick={() => {
										preparedHandlers.moveDown();
									}}
									title="move down (alt + down)"
								>
									<IoIosArrowRoundDown />
								</ToolbarButton>
								<ToolbarButton
									onClick={() => {
										preparedHandlers.up();
									}}
									title="previous item (up)"
								>
									<IoIosArrowUp />
								</ToolbarButton>
								<ToolbarButton
									onClick={() => {
										preparedHandlers.down();
									}}
									title="next item (down)"
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
		</div>
	);
};
