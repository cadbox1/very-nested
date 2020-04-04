import React, { useEffect } from "react";
import { Octokit } from "@octokit/rest";
import { usePromise } from "frontend/common/usePromise";

const octokit = new Octokit();

export const Manager = () => {
	const { pending, value, call } = usePromise<any>({
		promiseFunction: async () =>
			octokit.repos.listForOrg({
				org: "octokit",
				type: "public",
			}),
	});

	useEffect(() => {
		call();
	}, []);

	console.log(value);

	return (
		<div>
			<h1>Manager</h1>
			{pending && <p>pending</p>}
			{value?.data?.map((repo: any) => (
				<div>{repo.name}</div>
			))}
		</div>
	);
};
