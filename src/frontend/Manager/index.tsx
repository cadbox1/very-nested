import React, { useEffect, useState } from "react";
import { Octokit } from "@octokit/rest";
import { usePromise } from "frontend/common/usePromise";
import { generateAuthorizeUrl } from "frontend/common/oauth";

let octokit: Octokit;

const scope = "public_repo";

export const Manager = () => {
	const [accessToken, setAccessToken] = useState(
		localStorage.getItem("accessToken")
	);

	const setupOktokit = (accessToken: string) => {
		octokit = octokit = new Octokit({
			auth: accessToken,
		});
		octokit.hook.error("request", async (error, options) => {
			if (error.status === 401) {
				setAccessToken("");
			}
			throw error;
		});
	};

	const githubRepoRequest = usePromise<any>({
		promiseFunction: async () => octokit.repos.listForAuthenticatedUser(),
	});

	useEffect(() => {
		localStorage.setItem("accessToken", accessToken || "");
		setupOktokit(accessToken || "");

		if (accessToken) {
			githubRepoRequest.call();
		}
	}, [accessToken]);

	useEffect(() => {
		// @ts-ignore
		window.handleToken = (accessToken) => setAccessToken(accessToken);
	}, []);

	return (
		<div>
			<h1>Manager</h1>
			{!accessToken && (
				<a href={generateAuthorizeUrl({ scope })} target="_blank">
					Login with GitHub
				</a>
			)}
			{githubRepoRequest.pending && <p>pending</p>}
			{githubRepoRequest.value?.data?.map((repo: any) => (
				<div key={repo.name}>{repo.name}</div>
			))}
		</div>
	);
};
