import * as React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Viewer } from "../Viewer";

afterEach(cleanup);

test("displays text and can be clicked", () => {
	const onClick = jest.fn();

	const { getByText } = render(<Viewer />);
});
