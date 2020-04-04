import React, { useEffect, useState } from "react";
import { Octokit } from "@octokit/rest";
import { usePromise } from "frontend/common/usePromise";

let octokit: Octokit;

export const Manager = () => {
	const [accessToken, setAccessToken] = useState(
		localStorage.getItem("accessToken")
	);

	const githubRepoRequest = usePromise<any>({
		promiseFunction: async () => octokit.repos.listForAuthenticatedUser(),
	});

	useEffect(() => {
		if (accessToken) {
			localStorage.setItem("accessToken", accessToken);
			octokit = new Octokit({
				auth: accessToken,
			});
			githubRepoRequest.call();
		}
	}, [accessToken]);

	const githubAuthRequest = usePromise<any>({
		promiseFunction: async () =>
			fetch("/.netlify/functions/auth").then((response) => response.json()),
	});

	useEffect(() => {
		if (!accessToken) {
			githubAuthRequest.call();
		}

		// @ts-ignore
		window.handleToken = (accessToken) => setAccessToken(accessToken);
	}, []);

	return (
		<div>
			<h1>Manager</h1>
			{githubAuthRequest.fulfilled && (
				<a href={githubAuthRequest.value.url} target="_blank">
					Login with GitHub
				</a>
			)}
			{githubRepoRequest.pending && <p>pending</p>}
			{githubRepoRequest.value?.data?.map((repo: any) => (
				<div>{repo.name}</div>
			))}
		</div>
	);
};
