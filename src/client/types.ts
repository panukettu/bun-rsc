import "./extensions.d.ts";

import type { Context } from "hono";
import type {
	AnchorHTMLAttributes,
	CSSProperties,
	DOMAttributes,
	Dispatch,
	ReactNode,
	SetStateAction,
} from "react";
import type { RouterState } from "./Router.tsx";

export type SpeculationRules = {
	prefetch: {
		source: "list";
		urls: string[];
	}[];
	prerender: {
		source: "list";
		urls: string[];
	}[];
};

export type ActionOpts =
	| {
			stale?: true;
			href?: string;
	  }
	| undefined;

export type Action<T> = T extends (...args: infer U) => any
	? (
			...args: [...U, opts?: Partial<ActionOpts>]
	  ) => Promise<FuncReturn<T>> | FuncReturn<T>
	: never;

export type Resolved<T> = {
	[P in keyof T]: T[P] extends Promise<infer U> ? U : T[P];
};

type Obj<T = Record<string, any | Promise<any>>> = T;
type FuncReturn<T = Func> = T extends (...args: any[]) => infer U ? U : never;

type Func = (...args: any[]) => any;

export type Route<T = Record<string, any>> = (T extends Func
	? FuncReturn<T>
	: Obj<T>) & {
	children: (...props: any[]) => ReactNode;
} & BaseProps;
export type BaseProps = {
	route: `/${string}`;
	params: string[];
	ctx: Context;
	search: {
		[key: string]: string;
	} | null;
};

export type FallbackProps<T = any> = {
	error: T;
	reset: (...args: any[]) => void;
};

type HardLink = `/${string}`;
type SoftLink = Lowercase<string>;

export type Links = HardLink | SoftLink | null;

export type NavType<T> = T extends HardLink
	? HardLink
	: T extends null | SoftLink
	  ? SoftLink
	  : never;

export type Exists<T> = T extends null | undefined ? never : T;

type LinkBase = {
	pre?: "render" | "fetch" | false;
	back?: boolean;
	fallback?: string;
};

type LinkElement<Href extends Links> = Href extends HardLink
	? AnchorHTMLAttributes<HTMLAnchorElement>
	: DOMAttributes<HTMLSpanElement>;
export type LinkProps<Href extends Links> = LinkElement<Href> &
	LinkBase & {
		href: Href;
		children?: any;
		style?: CSSProperties;
		revalidate?: boolean;
	};

export type SetLocation = Dispatch<SetStateAction<RouterState>>;
