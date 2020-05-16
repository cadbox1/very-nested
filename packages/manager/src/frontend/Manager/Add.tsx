import React, { useState } from "react";
import { octokit } from "../Manager";
import { usePromise } from "frontend/common/usePromise";
import { Redirect } from "react-router-dom";

export interface AddProps {
	currentUser: string;
}

export const Add = ({ currentUser }: AddProps) => {
	const [name, setName] = useState("");

	const { pending, fulfilled, call } = usePromise<any>({
		promiseFunction: () => {
			return octokit.repos.createUsingTemplate({
				template_owner: "cadbox1",
				template_repo: "very-nested-template",
				name,
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
			<form onSubmit={handleSubmit}>
				Name:
				<input
					type="text"
					name="name"
					value={name}
					onChange={handleChange}
					disabled={pending}
					placeholder="very-nested-"
				/>
				<button type="submit" disabled={pending}>
					{pending ? "Adding..." : "Add"}
				</button>
			</form>
		</div>
	);
};
