/** @jsx jsx */
import { HashRouter as Router } from "react-router-dom";
import { Container, jsx } from "theme-ui";
import { Manager } from "./Manager";

const App = () => (
	<Router>
		<Container sx={{ p: 2 }}>
			<Manager />
		</Container>
	</Router>
);

export default App;
