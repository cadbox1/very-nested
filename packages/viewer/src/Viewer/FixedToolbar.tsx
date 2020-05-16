import React, { useState, useEffect } from "react";
import { Fragment } from "react";

export const FixedToolbar = ({ children }: { children: React.ReactNode }) => {
	const [topOffset, setTopOffset] = useState<number>(0);

	const handleViewport = () => {
		const layoutViewport = document.getElementById("layoutViewport");

		if (!layoutViewport) {
			return;
		}

		// @ts-ignore
		const viewport = window.visualViewport;
		var offsetTop =
			viewport.height -
			layoutViewport.getBoundingClientRect().height +
			viewport.offsetTop;

		setTopOffset(offsetTop);
	};

	useEffect(() => {
		// @ts-ignore
		if (window.visualViewport !== undefined) {
			// @ts-ignore
			window.visualViewport.addEventListener("scroll", handleViewport);
			// @ts-ignore
			window.visualViewport.addEventListener("resize", handleViewport);

			return () => {
				// @ts-ignore
				window.visualViewport.removeEventListener("scroll", handleViewport);
				// @ts-ignore
				window.visualViewport.removeEventListener("resize", handleViewport);
			};
		}
	}, []);

	return (
		<Fragment>
			<div
				id="layoutViewport"
				style={{ position: "fixed", height: "100%", width: "100%" }}
			/>
			<div
				style={{
					position: "fixed",
					bottom: 0,
					width: "100%",
					transform: `translate(0, ${topOffset}px)`,
				}}
			>
				{children}
			</div>
		</Fragment>
	);
};
