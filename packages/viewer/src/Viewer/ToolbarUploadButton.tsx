/** @jsx jsx */
import { jsx, Spinner } from "theme-ui";
import { toolbarButtonStyles } from "./ToolbarButton";
import { Fragment, useRef, useState, useEffect } from "react";
import { usePromise } from "@cadbox1/use-promise";

export type ToolbarUploadButtonProps = {
	onUpload: (fileWithName: FileWithName) => Promise<string>;
	onUploadComplete: (uri: string) => void;
	title: string;
	children: React.ReactNode;
};

export type FileWithName = {
	name?: string;
	base64: string;
};

export const ToolbarUploadButton = ({
	onUpload,
	onUploadComplete,
	title,
	children,
}: ToolbarUploadButtonProps) => {
	const fileInput = useRef<HTMLInputElement>(null);

	const [fileName, setFileName] = useState<string>();
	const [base64File, setBase64File] = useState<string>();

	const uploadRequest = usePromise({
		promiseFunction: async () => {
			if (!base64File) {
				return;
			}
			const uploadResponse = await onUpload({
				name: fileName,
				base64: base64File,
			});
			onUploadComplete(uploadResponse);
			return uploadResponse;
		},
	});

	useEffect(() => {
		uploadRequest.call();
	}, [base64File]);

	const handleChange = () => {
		const files = fileInput.current?.files;
		if (!files || files.length < 1) {
			return;
		}
		const file = files[0];

		setFileName("");
		setBase64File("");

		const reader = new FileReader();
		reader.addEventListener("load", () => {
			if (!reader.result || typeof reader.result !== "string") {
				return;
			}
			// https://stackoverflow.com/a/52311051/728602
			let encoded = reader.result.toString().replace(/^data:(.*,)?/, "");
			if (encoded.length % 4 > 0) {
				encoded += "=".repeat(4 - (encoded.length % 4));
			}
			setFileName(file.name || new Date().toUTCString());
			setBase64File(encoded);
			if (fileInput.current) {
				fileInput.current.value = "";
			}
		});
		reader.readAsDataURL(file);
	};

	const handleClick = () => {
		fileInput.current?.click();
	};

	return (
		<Fragment>
			<input
				type="file"
				onChange={handleChange}
				ref={fileInput}
				sx={{ display: "none" }}
			/>
			<button onClick={handleClick} title={title} sx={toolbarButtonStyles}>
				{uploadRequest.pending ? <Spinner size={13} /> : children}
			</button>
		</Fragment>
	);
};
