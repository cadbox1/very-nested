/** @jsx jsx */
import React, { useEffect } from "react";
import { jsx } from "theme-ui";
import { octokit } from ".";
import { usePromise } from "frontend/common/usePromise";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Base64 } from "js-base64";
import { persistor } from "index";

// @ts-ignore
import { load, Viewer } from "very-nested-viewer";

const veryNestedDataFile = "very-nested-data.json";

export const ManageRepo = () => {
	const { owner = "", repo = "" } = useParams();

	const repoRequest = usePromise<any>({
		promiseFunction: async () => {
			return octokit.repos.get({
				owner,
				repo,
			});
		},
	});

	const dispatch = useDispatch();

	const getRequest = usePromise<any>({
		promiseFunction: async () => {
			const response: any = await octokit.repos.getContents({
				repo,
				owner,
				path: veryNestedDataFile,
			});

			const data = response.data;

			const content = JSON.parse(Base64.decode(data.content));
			dispatch(load({ data: content }));

			return data;
		},
	});

	useEffect(() => {
		repoRequest.call();
		getRequest.call();
	}, [repo, owner]);

	// @ts-ignore
	const itemState = useSelector(state => state.item);

	const saveRequest = usePromise<any>({
		promiseFunction: async () => {
			const jsonState = JSON.stringify(itemState, null, 1);
			const base64JsonState = Base64.encode(jsonState);

			await octokit.repos.createOrUpdateFile({
				owner,
				repo,
				path: veryNestedDataFile,
				sha: getRequest.value.sha,
				content: base64JsonState,
				message: "Updated very-nested-data",
			});
			return getRequest.call();
		},
	});

	const handleSave = () => {
		saveRequest.call();
	};

	const handleRevert = () => {
		persistor.purge();
		getRequest.call();
	};

	return (
		<div>
			<div>
				<Link to="/">{"< Home"}</Link>
			</div>
			<h2 sx={{ mt: 4 }}>{repo}</h2>
			<p>
				repo url:{" "}
				{repoRequest.pending ? (
					"loading..."
				) : repoRequest.fulfilled ? (
					<a href={repoRequest.value.data.html_url} target="_blank">
						{repoRequest.value.data.html_url}
					</a>
				) : (
					"error loading url"
				)}
			</p>
			<div sx={{ mb: 6 }}>
				<button
					type="button"
					onClick={handleSave}
					disabled={saveRequest.pending}
				>
					{saveRequest.pending ? "Saving..." : "Save"}
				</button>
				<button
					type="button"
					onClick={handleRevert}
					disabled={getRequest.pending}
				>
					Revert local changes
				</button>
			</div>
			<div>
				{saveRequest.rejected && <p>There was an issue saving your repo :(</p>}
				{getRequest.pending && <p>Loading...</p>}
				{getRequest.rejected && (
					<p>
						We couldn't read this repository, are you sure it's a very nested
						repo?
					</p>
				)}
				{getRequest.fulfilled && <Viewer />}
			</div>
		</div>
	);
};
