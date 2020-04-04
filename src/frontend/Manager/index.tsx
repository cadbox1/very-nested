import React, { useEffect } from "react";
import { Octokit } from "@octokit/rest";
import { usePromise } from "frontend/common/usePromise";

const octokit = new Octokit();

export const Manager = () => {
	const helloWorldRequest = usePromise<any>({
		promiseFunction: async () =>
			fetch("/.netlify/functions/hello-world").then((response) =>
				response.json()
			),
	});

	const githubRepoRequest = usePromise<any>({
		promiseFunction: async () =>
			octokit.repos.listForOrg({
				org: "octokit",
				type: "public",
			}),
	});

	useEffect(() => {
		helloWorldRequest.call();
		githubRepoRequest.call();
	}, []);

	console.log(helloWorldRequest.value);

	return (
		<div>
			<h1>Manager</h1>
			{helloWorldRequest.fulfilled && (
				<h2>Message: {helloWorldRequest.value?.message}</h2>
			)}
			{githubRepoRequest.pending && <p>pending</p>}
			{githubRepoRequest.value?.data?.map((repo: any) => (
				<div>{repo.name}</div>
			))}
		</div>
	);
};
