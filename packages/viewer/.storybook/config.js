import { configure } from "@storybook/react";

const loadStories = () => {
	return [
		// Ensure we load Welcome First
		require.context("../docs", true, /Intro.stories.mdx/),
	];
};

configure(loadStories(), module);
