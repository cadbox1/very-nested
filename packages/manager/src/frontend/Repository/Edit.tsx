/** @jsx jsx */
import { jsx, Styled, Button } from "theme-ui";
import { useEffect } from "react";
import { octokit } from "./List";
import { usePromise } from "frontend/common/usePromise";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Base64 } from "js-base64";
import { persistor } from "index";

// @ts-ignore
import { load, Viewer } from "very-nested-viewer";
import { FileWithName } from "very-nested-viewer/dist/Viewer/ToolbarUploadButton";

const veryNestedDataFile = "very-nested-data.json";
const filesFolder = "files/";

export const Edit = () => {
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

	const handleSave = async () => {
		await saveRequest.call();

		// hide the saved prompt after 10 seconds
		setTimeout(() => {
			saveRequest.reset();
		}, 10000);
	};

	const handleRevert = () => {
		persistor.purge();
		getRequest.call();
	};

	const uploadRequest = usePromise<string>({
		promiseFunction: async ({ name, base64 }: FileWithName) => {
			let path = filesFolder + name;
			try {
				await octokit.repos.createOrUpdateFileContents({
					owner,
					repo,
					path,
					content: base64,
					message: "Uploaded a file",
				});
			} catch (error) {
				if (error.status !== 422) {
					throw error;
				}
				// file is a duplicate, append something to it
				const pathWithoutExtension = path.substr(0, path.lastIndexOf("."));
				const extensionIncludingDot = path.substr(path.lastIndexOf("."));
				path =
					pathWithoutExtension +
					" - " +
					new Date().toUTCString() +
					extensionIncludingDot;

				await octokit.repos.createOrUpdateFileContents({
					owner,
					repo,
					path,
					content: base64,
					message: "Uploaded a file",
				});
			}
			return path;
		},
	});

	const handleUpload = async (fileWithName: FileWithName) => {
		const path = await uploadRequest.call(fileWithName);
		return "./" + path;
	};

	const getBaseUrl = () => {
		const domain = "https://raw.githubusercontent.com";
		const branch = "master";
		return domain + "/" + owner + "/" + repo + "/" + branch;
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
					repository:{" "}
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
					published at:{" "}
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
			{saveRequest.fulfilled && (
				<div sx={{ fontSize: 1, mt: 4 }}>
					Saved! It might take up to 10 minutes before your changes are
					displayed.
				</div>
			)}
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
				{getRequest.fulfilled && (
					<Viewer baseUrl={getBaseUrl()} onUpload={handleUpload} />
				)}
			</div>
		</div>
	);
};
