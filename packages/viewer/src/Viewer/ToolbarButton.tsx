/** @jsx jsx */
import { jsx } from "theme-ui";

export type ToolbarButtonProps = {
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	title?: string;
	children: React.ReactNode;
};

export const toolbarButtonStyles = {
	py: 2,
	px: 3,
	border: "none",
	background: "none",
};

export const ToolbarButton = ({
	onClick,
	title,
	children,
	...props
}: ToolbarButtonProps) => (
	<button onClick={onClick} title={title} sx={toolbarButtonStyles} {...props}>
		{children}
	</button>
);
