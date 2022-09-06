/** @jsx jsx */
import { jsx, Styled } from "theme-ui";
import { useEffect, useState } from "react";
import { Octokit } from "@octokit/rest";
import { Switch, Route, Link, useLocation } from "react-router-dom";
import queryString from "query-string";
import { usePromise } from "frontend/common/usePromise";
// @ts-ignore
import { generateAuthorizeUrl } from "very-nested-login";
import { Add } from "./Add";
import { Edit } from "./Edit";

export let octokit: Octokit;

const scope = "public_repo";

export const List = () => {
	const [accessToken, setAccessToken] = useState(
		localStorage.getItem("accessToken")
	);

	const { search } = useLocation();
	useEffect(() => {
		const { accessToken: accessTokenFromUrl } = queryString.parse(search);
		if (accessTokenFromUrl && accessTokenFromUrl != accessToken) {
			// @ts-ignore
			localStorage.setItem("accessToken", accessTokenFromUrl);
			window.location.href = "/";
		}
	}, [search]);

	const setupOktokit = (accessToken: string) => {
		octokit = octokit = new Octokit({
			auth: accessToken,
		});
		octokit.hook.error("request", async (error, options) => {
			// @ts-ignore
			if (error.status === 401) {
				setAccessToken("");
				localStorage.setItem("accessToken", "");
			}
			throw error;
		});
	};

	const repos = usePromise<any>({
		promiseFunction: async () =>
			octokit.repos.listForAuthenticatedUser({ per_page: 100 }),
	});
	const currentUser = usePromise<any>({
		promiseFunction: async () => octokit.users.getAuthenticated(),
	});

	useEffect(() => {
		setupOktokit(accessToken || "");

		if (accessToken) {
			repos.call();
			currentUser.call();
		}
	}, [accessToken]);

	return (
		<div>
			{!accessToken && (
				<Styled.a href={generateAuthorizeUrl({ scope })} sx={{ fontSize: 2 }}>
					Login with GitHub
				</Styled.a>
			)}
			{accessToken && octokit && (
				<Switch>
					<Route path="/add">
						<Add currentUser={currentUser.value?.data?.login} />
					</Route>
					<Route path="/repo/:owner/:repo">
						<Edit />
					</Route>
					<Route path="/">
						<Styled.h1 sx={{ fontSize: 4 }}>Very Nested Manager</Styled.h1>
						<div sx={{ mt: 0 }}>
							<Styled.a
								href="https://verynested.cadell.dev/"
								sx={{ fontSize: 1 }}
							>
								Back to Homepage
							</Styled.a>
						</div>
						<div>
							<div sx={{ mt: 6 }}>
								<Link to="/add" sx={{ fontSize: 1 }}>
									Add
								</Link>
							</div>
							<div sx={{ mt: 4 }}>
								{repos.pending && <p sx={{ fontSize: 2 }}>pending</p>}
								{repos.value?.data?.some((repo: any) =>
									repo.name.startsWith("very-nested")
								) && (
									<Styled.h2 sx={{ fontSize: 3 }}>Very Nested Repos</Styled.h2>
								)}
								{repos.value?.data
									?.filter((repo: any) => repo.name.startsWith("very-nested"))
									.map((repo: any) => (
										<div key={repo.name}>
											<Link to={`repo/${repo.full_name}`} sx={{ fontSize: 1 }}>
												{repo.name}
											</Link>
										</div>
									))}
								{repos.value?.data?.some(
									(repo: any) => !repo.name.startsWith("very-nested")
								) && (
									<Styled.h2 sx={{ fontSize: 3, mt: 5 }}>Other Repos</Styled.h2>
								)}
								{repos.value?.data
									?.filter((repo: any) => !repo.name.startsWith("very-nested"))
									.map((repo: any) => (
										<div key={repo.name}>
											<Link to={`repo/${repo.full_name}`} sx={{ fontSize: 1 }}>
												{repo.name}
											</Link>
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
