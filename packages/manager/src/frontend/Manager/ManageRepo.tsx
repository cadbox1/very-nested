/** @jsx jsx */
import { jsx, Styled, Button } from "theme-ui";
import { useEffect } from "react";
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

	const getPagesRequest = usePromise<any>({
		promiseFunction: async () => {
			return octokit.repos.getPages({
				owner,
				repo,
			});
		},
	});

	useEffect(() => {
		if (repoRequest.value && repoRequest.value.data.has_pages) {
			getPagesRequest.call();
		}
	}, [repoRequest.value]);

	const dispatch = useDispatch();

	const getRequest = usePromise<any>({
		promiseFunction: async () => {
			const response: any = await octokit.repos.getContent({
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

			await octokit.repos.createOrUpdateFileContents({
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
				<Link to="/" sx={{ fontSize: 1 }}>
					{"< Home"}
				</Link>
			</div>
			<Styled.h2 sx={{ fontSize: 4, mt: 4 }}>{repo}</Styled.h2>
			<div sx={{ fontSize: 1 }}>
				<div>
					repo url:{" "}
					{repoRequest.pending
						? "loading..."
						: repoRequest.rejected
						? "error loading url"
						: repoRequest.value && (
								<a
									href={repoRequest.value.data.html_url}
									target="_blank"
									rel="noopener noreferrer"
								>
									{repoRequest.value.data.html_url}
								</a>
						  )}
				</div>
				<div>
					published url:{" "}
					{repoRequest.pending
						? "loading..."
						: repoRequest.rejected
						? "error loading url"
						: repoRequest.value &&
						  (!repoRequest.value.data.has_pages
								? "no pages url found"
								: getPagesRequest.pending
								? "loading..."
								: getPagesRequest.rejected
								? "error loading url"
								: getPagesRequest.value && (
										<a
											href={getPagesRequest.value.data.html_url}
											target="_blank"
											rel="noopener noreferrer"
										>
											{getPagesRequest.value.data.html_url}
										</a>
								  ))}
				</div>
			</div>
			<div sx={{ fontSize: 1, mt: 4 }}>
				<Button
					type="button"
					onClick={handleSave}
					disabled={saveRequest.pending}
					sx={{ py: 1, px: 3 }}
				>
					{saveRequest.pending ? "Saving..." : "Save"}
				</Button>
				<Button
					type="button"
					variant="danger"
					onClick={handleRevert}
					disabled={getRequest.pending}
					sx={{ py: 1, px: 3, ml: 2 }}
				>
					Revert changes
				</Button>
			</div>
			<div sx={{ mt: 6 }}>
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
