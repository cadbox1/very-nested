/** @jsx jsx */
import { jsx, Button } from "theme-ui";
import React, { useState } from "react";
import { octokit } from "./List";
import { usePromise } from "frontend/common/usePromise";
import { Redirect, Link } from "react-router-dom";

function timeout(timeoutInMs: number) {
	return new Promise(resolve => setTimeout(resolve, timeoutInMs));
}

export interface AddProps {
	currentUser: string;
}

export const Add = ({ currentUser }: AddProps) => {
	const [name, setName] = useState("");

	const { pending, rejected, fulfilled, call } = usePromise<any>({
		promiseFunction: async () => {
			await octokit.repos.createUsingTemplate({
				template_owner: "cadbox1",
				template_repo: "very-nested-template",
				name,
			});

			await timeout(1000); // timeout to cater for asynchronous branch creation.

			const owner = currentUser;
			const repo = name;

			return octokit.repos.createPagesSite({
				owner,
				repo,
				source: {
					branch: "master",
					path: "/",
				},
			});
		},
	});

	const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		setName(evt.target.value);
	};

	const handleSubmit = async (evt: React.SyntheticEvent) => {
		evt.preventDefault();
		call();
	};

	if (fulfilled) {
		return <Redirect to={`repo/${currentUser}/${name}`} />;
	}

	return (
		<div>
			<div>
				<Link to="/" sx={{ fontSize: 1 }}>
					{"< Home"}
				</Link>
			</div>
			<form onSubmit={handleSubmit} sx={{ mt: 5 }}>
				<div sx={{ fontSize: 1 }}>
					{"Name: "}
					<input
						type="text"
						name="name"
						value={name}
						onChange={handleChange}
						disabled={pending}
						placeholder="very-nested-"
					/>
				</div>
				<p sx={{ fontSize: 1, mt: 2 }}>
					No spaces please - spaces are not allowed in GitHub repository names.
				</p>
				{rejected && <p>There was an issue creating this repository.</p>}
				<Button type="submit" disabled={pending} sx={{ fontSize: 1 }}>
					{pending ? "Creating..." : "Create"}
				</Button>
			</form>
		</div>
	);
};
