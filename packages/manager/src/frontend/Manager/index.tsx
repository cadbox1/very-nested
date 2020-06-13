/** @jsx jsx */
import React, { useEffect, useState } from "react";
import { jsx, Styled } from "theme-ui";
import { Octokit } from "@octokit/rest";
import { Switch, Route, Link, useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";
import { usePromise } from "frontend/common/usePromise";
// @ts-ignore
import { generateAuthorizeUrl } from "very-nested-login";
import { Add } from "./Add";
import { ManageRepo } from "./ManageRepo";

export let octokit: Octokit;

const scope = "public_repo";

export const Manager = () => {
	const [accessToken, setAccessToken] = useState(
		localStorage.getItem("accessToken")
	);

	const history = useHistory();
	const { search } = useLocation();
	useEffect(() => {
		const { accessToken: accessTokenFromUrl } = queryString.parse(search);
		if (accessTokenFromUrl && accessTokenFromUrl != accessToken) {
			// @ts-ignore
			setAccessToken(accessTokenFromUrl);
			history.replace("/");
		}
	}, [search]);

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

	return (
		<div>
			{!accessToken && (
				<a href={generateAuthorizeUrl({ scope })}>Login with GitHub</a>
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
						<Styled.h1 sx={{ fontSize: 3 }}>Very Nested Manager</Styled.h1>
						<div sx={{ mt: 5 }}>
							<Link to="/add">Add</Link>
							<div sx={{ mt: 5 }}>
								{repos.pending && <p>pending</p>}
								{repos.value?.data?.some((repo: any) =>
									repo.name.startsWith("very-nested")
								) && (
									<Styled.h2 sx={{ fontSize: 2 }}>Very Nested Repos</Styled.h2>
								)}
								{repos.value?.data
									?.filter((repo: any) => repo.name.startsWith("very-nested"))
									.map((repo: any) => (
										<div key={repo.name}>
											<Link to={`repo/${repo.full_name}`}>{repo.name}</Link>
										</div>
									))}
								{repos.value?.data?.some(
									(repo: any) => !repo.name.startsWith("very-nested")
								) && (
									<Styled.h2 sx={{ fontSize: 2, mt: 5 }}>Other Repos</Styled.h2>
								)}
								{repos.value?.data
									?.filter((repo: any) => !repo.name.startsWith("very-nested"))
									.map((repo: any) => (
										<div key={repo.name}>
											<Link to={`repo/${repo.full_name}`}>{repo.name}</Link>
										</div>
									))}
							</div>
						</div>
					</Route>
				</Switch>
			)}
		</div>
	);
};
