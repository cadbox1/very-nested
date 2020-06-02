/** @jsx jsx */
import { jsx, useColorMode } from "theme-ui";
import { Link } from "gatsby";
// @ts-ignore
import { generateAuthorizeUrl } from "very-nested-login";

const navItemMX = 2;

const navItemStyles = {
	mt: 2,
	mx: navItemMX,
	fontWeight: 600,
	fontSize: 1,
	textDecoration: "none",
	color: "text",
};

const navItemActiveStyles = {
	textDecoration: "underline",
	cursor: "default",
};

export interface HeaderProps {
	title: string;
}

export const Header = ({ title }: HeaderProps) => {
	const [colorMode, setColorMode] = useColorMode();
	const isDark = colorMode === `dark`;
	const toggleColorMode = () => {
		setColorMode(isDark ? `light` : `dark`);
	};

	return (
		<nav
			sx={{
				display: "flex",
				alignItems: "center",
				maxWidth: `container`,
				mx: `auto`,
				px: 3,
				py: 2,
				mb: 6,
			}}
		>
			<div sx={{ mx: -navItemMX }}>
				<Link to="/" sx={navItemStyles} activeStyle={navItemActiveStyles}>
					{title}
				</Link>
				<Link
					to="/get-started"
					sx={navItemStyles}
					activeStyle={navItemActiveStyles}
				>
					Get Started
				</Link>
				<a href={generateAuthorizeUrl({})} sx={navItemStyles}>
					Sign In
				</a>
			</div>

			<div sx={{ ml: "auto" }}>
				<button
					onClick={toggleColorMode}
					sx={{
						fontWeight: "bold",
						fontSize: 1,
						backgroundColor: "muted",
						py: 3,
						px: 4,
						color: "text",
						border: "none",
						cursor: "pointer",
					}}
				>
					{isDark ? "Dark" : "Light"}
				</button>
			</div>
		</nav>
	);
};
