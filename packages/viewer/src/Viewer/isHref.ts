/**
 * Checks if a string can be used as a href for an anchor.
 *
 * Internally, it just checks if there are two strings seprated by a dot. Bit naive but oh well.
 *
 * @param input input string to check
 */
export function isHref(input: string): boolean {
	return /[a-zA-Z]+\.[a-zA-Z]/.test(input);
}
