import React from "react";
import { Container, MdxProvider, Header } from "cadells-vanilla-components";
import "cadells-vanilla-components/dist/index.css";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/600.css";

const App = ({ Component, pageProps }) => (
	<MdxProvider>
		<Container>
			<Header githubHref="https://github.com/cadbox1/very-nested" />
			<Component {...pageProps} />
		</Container>
	</MdxProvider>
);

export default App;
