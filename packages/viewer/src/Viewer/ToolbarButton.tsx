/** @jsx jsx */
import { jsx } from "theme-ui";

export type ToolbarButtonProps = {
	onClick?: (...args: []) => void;
	title?: string;
	children: React.ReactNode;
};

export const ToolbarButton = ({
	onClick,
	title,
	children,
	...props
}: ToolbarButtonProps) => (
	<button
		onClick={onClick}
		title={title}
		sx={{
			py: 2,
			px: 3,
			border: "none",
			background: "none",
		}}
		{...props}
	>
		{children}
	</button>
);
