const path = require("path");

module.exports = {
	mode: "development",
	entry: "./src/index.ts",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.(tsx|ts|js|jsx)?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.umd.js",
		library: "VeryNestedViewer",
		libraryTarget: "umd",
	},
	externals: {
		react: "React",
		"react-dom": "ReactDOM",
	},
};
