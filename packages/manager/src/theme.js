import "typeface-source-sans-pro";

export default {
	// useColorSchemeMediaQuery: true,
	fonts: {
		body:
			'"source sans pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
		heading:
			'"source sans pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
		monospace: `Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace`,
	},
	colors: {
		text: "#000",
		background: "#fff",
		primary: "#007bff",
		danger: "#dc3545",
		muted: "hsl(0, 0%, 96%)",
		heading: "text",
		modes: {
			dark: {
				text: "#fff",
				background: "#000",
				primary: "#007bff",
				muted: "hsl(0, 0%, 10%)",
			},
		},
	},
	space: [0, 4, 8, 12, 16, 24, 32, 64, 96, 128],
	sizes: {
		container: 850,
	},
	fontSizes: [16, 18, 20, 24, 32, 36, 44],
	lineHeights: {
		body: 1.7,
		heading: 1.2,
	},
	fontWeights: {
		body: 400,
		heading: 600,
		bold: 600,
	},
	container: {
		p: 2,
	},
	viewer: {
		item: {
			fontSize: 1,
		},
	},
	buttons: {
		primary: {
			color: "background",
			bg: "primary",
		},
		danger: {
			color: "background",
			bg: "danger",
		},
	},
	styles: {
		root: {
			fontFamily: "body",
			lineHeight: "body",
			fontWeight: "body",
		},
		a: {
			textDecoration: "none",
			":active, :hover": {
				textDecoration: "underline",
			},
		},
		p: {
			fontSize: 2,
		},
		pre: {
			fontSize: 0,
		},
	},
};
