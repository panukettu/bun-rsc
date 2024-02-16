"use client";

import { createContext } from "react";

export type RouterState = {
	revalidateNext?: boolean | "next";
	route: string;
	search: string;
};

export type RouterCtx = {
	navigate: (nextLocation: string, revalidate?: boolean | "next") => void;
	revalidateNext: () => void;
	back: () => void;
	location: RouterState;
};

export const defaultRouterCtx = {
	location: {
		route: typeof window !== "undefined" ? window.location.pathname : "",
		search: typeof window !== "undefined" ? window.location.search : "",
	},
	revalidateNext: () => {},
	navigate: (_nextLocation: string, _revalidate?: boolean | "next") => {},
	back: () => {
		if (typeof window !== "undefined") {
			window.history.back();
		}
	},
};
export const RouterContext = createContext<RouterCtx>(defaultRouterCtx);

const { useRouter } = require("./lazy");

export { useRouter };
