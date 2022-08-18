/**
 * Checks if a string can be used as a href for an anchor.
 *
 * Internally, it just checks if there are two strings seprated by a dot. Bit naive but oh well.
 *
 * @param input input string to check
 */
export function isHref(input: string): boolean {
	if (!input) {
		return false;
	}
	return /[a-zA-Z]+\.[a-zA-Z]/.test(input) || input.startsWith("./");
}

export function isImageSrc(input: string): boolean {
	return (
		isHref(input) &&
		(input.endsWith(".jpg") ||
			input.endsWith(".jpeg") ||
			input.endsWith(".png") ||
			input.endsWith(".gif"))
	);
}

export function possiblyPrependBaseUrl(
	input: string,
	baseUrl?: string
): string {
	if (baseUrl && input.startsWith("./")) {
		return baseUrl + input.substr(1);
	}
	return input;
}
