import { Button } from "cadells-vanilla-components";
import { appClass } from "./styles.css";

export function App() {
	const handleClick = () => {
		alert("Hello!");
	};
	return (
		<div className={appClass}>
			{/* @ts-ignore */}
			<Button onClick={handleClick}>Click Me</Button>
		</div>
	);
}
