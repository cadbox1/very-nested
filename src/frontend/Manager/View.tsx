import React, { useState, useEffect } from "react";
import { octokit } from "../Manager";
import { usePromise } from "frontend/common/usePromise";
import { useParams } from "react-router-dom";
import Viewer from "frontend/Viewer";

export const View = () => {
	const { user = "", name = "" } = useParams();

	const { pending, fulfilled, rejected, value, call } = usePromise<any>({
		promiseFunction: async () => {
			const response: any = await octokit.repos.getContents({
				owner: user,
				repo: name,
				path: "very-nested-data.json",
			});
			const content = atob(response.data.content);
			return content;
		},
	});

	useEffect(() => {
		call();
	}, []);

	return (
		<div>
			<h2>{name}</h2>
			{pending && <p>Loading...</p>}
			{rejected && (
				<p>
					We couldn't read this repository, are you sure it's a very-nested
					repo?
				</p>
			)}
			{/* 
            // @ts-ignore */}
			{fulfilled && <Viewer content={value} />}
		</div>
	);
};
