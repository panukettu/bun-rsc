/// <reference types="react/experimental" />

import type { BaseProps, Resolved } from "../client/types";

export type Injects = {
	files?: boolean;
	head?: boolean;
};
export type CallServerCallback = <A, T>(msg: string, args: A) => Promise<T>;

export type RSCPayload = [
	reactId: `$${string}`,
	el: string,
	key: string,
	{ children: any[] },
];

export type Exports<T = any> = {
	Props?: (props: BaseProps) => T;
	Layout: (props: T) => React.ReactNode;
	Content: (props: Resolved<T>) => React.ReactNode;
};

export type ClientFiles = {
	inputPath: string;
	outputPath: string;
	fileName: string;
	exportNames?: string[];
	css?: boolean;
	lib?: boolean;
	fallback?: boolean;
	initializer?: boolean;
	dev?: boolean;
	page: string;
}[];

export type BuildContext = {
	modules: Record<string, string>[];
	css: string[];
	fallback?: string;
};

export type ErrProps<T = any> = {
	error: T;
	reset: (...args: any[]) => void;
};
