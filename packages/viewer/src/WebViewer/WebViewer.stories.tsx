import React from "react";
import { WebViewer } from "WebViewer";

export default {
	title: "WebViewer",
	component: WebViewer,
};

export const WebViewerYoutube = () => {
	return <WebViewer url="./youtube.json" />;
};
