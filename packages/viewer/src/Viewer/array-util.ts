/**
 * Get items from an array by it's index with negative indexes working from the end of the array.
 * @param input Input array.
 * @param index Index to get. Negative indexes work from the end of the array.
 */
export function getItemInArrayByIndex<T = any>(input: T[], index: number): T {
	if (index > 0) {
		return input[index];
	} else {
		return input[input.length + index];
	}
}

export function getIndexFromItem<T = any>(
	input: T[],
	item: T,
	index: number
): T {
	const itemIndex = input.indexOf(item);
	return input[itemIndex + index];
}

export function insertItemInArrayAfter<T = any>(
	input: T[],
	afterItem: T,
	item: T
) {
	const insertIndex = input.indexOf(afterItem) + 1;
	input.splice(insertIndex, 0, item);
}

export function getLastItemInArray<T = any>(input: T[]): T {
	return getItemInArrayByIndex(input, -1);
}

export function removeItemFromArray<T = any>(input: T[], item: T) {
	const targetIndex = input.indexOf(item);
	input.splice(targetIndex, 1);
}

export function objectMap<T = any>(
	obj: {},
	fn: ({ key, value, index }: { key: {}; value: any; index: number }) => T
) {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value], index) => [
			key,
			fn({ key, value, index }),
		])
	);
}
