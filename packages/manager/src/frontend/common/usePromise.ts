import { useState } from "react";

export enum PromiseStatus {
	NotStarted = "not_started",
	Pending = "pending",
	Fulfilled = "fulfilled",
	Rejected = "rejected",
}

export interface PromiseState<T = {}> {
	pending: boolean;
	fulfilled: boolean;
	rejected: boolean;
	value: T | undefined;
	reason: Error | undefined;
}

export interface UsePromise<T = {}> extends PromiseState<T> {
	call: (...args: any[]) => Promise<any>;
	reset: () => void;
}

export interface UpdateableState<T = {}> {
	state: T;
	setState: any;
}

export const initialRequest: PromiseState = {
	pending: false,
	fulfilled: false,
	rejected: false,
	value: undefined,
	reason: undefined,
};

export interface UsePromiseArguments {
	promiseFunction: (...promiseFunctionParameters: any[]) => Promise<any>;
	updateableRequest?: UpdateableState<PromiseState<any>>;
}

export function usePromise<T = {}>({
	promiseFunction,
	updateableRequest: updateableRequestProp,
}: UsePromiseArguments): UsePromise<T> {
	const [localRequest, setLocalRequest] = useState<PromiseState>(
		initialRequest
	);
	const localUpdateableState: UpdateableState<PromiseState> = {
		state: localRequest,
		setState: setLocalRequest,
	};

	const updateableRequest = updateableRequestProp || localUpdateableState;

	const updateRequest = (patchRequest: Partial<PromiseState>) => {
		updateableRequest.setState({
			...updateableRequest.state,
			...patchRequest,
		});
	};

	const wrappedPromiseFunction = (...args: []): Promise<any> => {
		updateRequest({ pending: true });
		return promiseFunction.apply(null, args).then(
			result => {
				updateRequest({
					pending: false,
					fulfilled: true,
					rejected: false,
					value: result,
				});
				return result;
			},
			error => {
				updateRequest({
					pending: false,
					fulfilled: false,
					rejected: true,
					reason: error,
				});
				throw error;
			}
		);
	};

	return {
		...updateableRequest.state,
		call: wrappedPromiseFunction,
		reset: () => {
			updateableRequest.setState({ ...initialRequest });
		},
	};
}
