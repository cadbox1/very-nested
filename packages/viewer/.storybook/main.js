module.exports = {
	stories: ["../src/**/*.stories.(js|mdx|tsx)"],
	addons: [
		"@storybook/preset-create-react-app",
		{
			name: "@storybook/addon-docs",
			options: {
				configureJSX: true,
			},
		},
		"@storybook/addon-actions",
		"@storybook/addon-links",
		"@storybook/addon-viewport/register",
	],
};
