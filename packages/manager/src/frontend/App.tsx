/** @jsx jsx */
import { HashRouter as Router } from "react-router-dom";
import { Container, jsx } from "theme-ui";
import { List } from "./Repository/List";

const App = () => (
	<Router>
		<Container>
			<List />
		</Container>
	</Router>
);

export default App;
