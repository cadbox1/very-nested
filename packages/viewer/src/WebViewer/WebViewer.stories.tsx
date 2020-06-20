import React from "react";
import { WebViewer } from "WebViewer";

export default {
	title: "WebViewer",
	component: WebViewer,
};

export const WebViewerCooking = () => {
	return <WebViewer url="./cookingExample.json" />;
};
