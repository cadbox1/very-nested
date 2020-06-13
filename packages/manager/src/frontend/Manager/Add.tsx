/** @jsx jsx */
import React, { useState } from "react";
import { jsx } from "theme-ui";
import { octokit } from "../Manager";
import { usePromise } from "frontend/common/usePromise";
import { Redirect, Link } from "react-router-dom";

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

			const owner = currentUser;
			const repo = name;

			return octokit.repos.createPagesSite({
				owner,
				repo,
				source: {
					branch: "master",
					path: "",
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
				<Link to="/">{"< Home"}</Link>
			</div>
			<form onSubmit={handleSubmit} sx={{ mt: 5 }}>
				<div>
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
				<p sx={{ mt: 2 }}>
					No spaces please - spaces are not allowed in GitHub repository names.
				</p>
				{rejected && <p>There was an issue creating this repository.</p>}
				<button type="submit" disabled={pending}>
					{pending ? "Creating..." : "Create"}
				</button>
			</form>
		</div>
	);
};
