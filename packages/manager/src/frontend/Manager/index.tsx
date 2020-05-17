import React, { useEffect, useState } from "react";
import { Octokit } from "@octokit/rest";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import { usePromise } from "frontend/common/usePromise";
import { generateAuthorizeUrl } from "frontend/common/oauth";
import { Add } from "./Add";
import { ManageRepo } from "./ManageRepo";

export let octokit: Octokit;

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

	const repos = usePromise<any>({
		promiseFunction: async () => octokit.repos.listForAuthenticatedUser(),
	});
	const currentUser = usePromise<any>({
		promiseFunction: async () => octokit.users.getAuthenticated(),
	});

	useEffect(() => {
		localStorage.setItem("accessToken", accessToken || "");
		setupOktokit(accessToken || "");

		if (accessToken) {
			repos.call();
			currentUser.call();
		}
	}, [accessToken]);

	useEffect(() => {
		// @ts-ignore
		window.handleToken = accessToken => setAccessToken(accessToken);
	}, []);

	return (
		<Router>
			{!accessToken && (
				<a href={generateAuthorizeUrl({ scope })} target="_blank">
					Login with GitHub
				</a>
			)}
			{octokit && (
				<Switch>
					<Route path="/add">
						<Add currentUser={currentUser.value?.data?.login} />
					</Route>
					<Route path="/repo/:owner/:repo">
						<ManageRepo />
					</Route>
					<Route path="/">
						<Link to="/add" style={{ marginTop: "2rem" }}>
							Add
						</Link>
						<div style={{ marginTop: "1rem" }}>
							{repos.pending && <p>pending</p>}
							{repos.value?.data?.map((repo: any) => (
								<div key={repo.name}>
									<Link to={`repo/${repo.full_name}`}>{repo.name}</Link>
								</div>
							))}
						</div>
					</Route>
				</Switch>
			)}
		</Router>
	);
};
