import React, { useEffect } from "react";
import { octokit } from ".";
import { usePromise } from "frontend/common/usePromise";
import { useParams } from "react-router-dom";
import { Viewer } from "frontend/Viewer";
import { useSelector, useDispatch } from "react-redux";
import { persistor } from "index";
import { load } from "frontend/Viewer/duck";

const veryNestedDataFile = "very-nested-data.json";

export const ManageRepo = () => {
	const { owner = "", repo = "" } = useParams();

	const dispatch = useDispatch();

	const getRequest = usePromise<any>({
		promiseFunction: async () => {
			const response: any = await octokit.repos.getContents({
				repo,
				owner,
				path: veryNestedDataFile,
			});

			const data = response.data;

			const content = JSON.parse(atob(data.content));
			dispatch(load({ data: content }));

			return data;
		},
	});

	useEffect(() => {
		getRequest.call();
	}, [repo, owner]);

	// @ts-ignore
	const itemState = useSelector((state) => state.item);

	const saveRequest = usePromise<any>({
		promiseFunction: async () => {
			const jsonState = JSON.stringify(itemState, null, 1);
			const base64JsonState = btoa(jsonState);

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
			<h2>{repo}</h2>
			<button type="button" onClick={handleSave} disabled={saveRequest.pending}>
				{saveRequest.pending ? "Saving..." : "Save"}
			</button>
			<button
				type="button"
				onClick={handleRevert}
				disabled={getRequest.pending}
			>
				Revert local changes
			</button>
			{getRequest.pending && <p>Loading...</p>}
			{getRequest.rejected && (
				<p>
					We couldn't read this repository, are you sure it's a very nested
					repo?
				</p>
			)}
			{getRequest.fulfilled && <Viewer />}
		</div>
	);
};
