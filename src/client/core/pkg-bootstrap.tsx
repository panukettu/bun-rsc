"use client";

import { use, useEffect } from "react";
import { createFromFetch, encodeReply } from "react-server-dom/client.browser";
import type { FallbackProps } from "../types";

export const routeCache = new Map();

const opts = {
	moduleBaseURL: `/${process.env.APP_PUBLIC_STATIC_ASSET_DIR}/`,
	callServer,
};

export const initialize = () => {
	const stream = new ReadableStream({
		start(controller) {
			const els = _nd.querySelectorAll("p");
			if (els.length > 0) els.forEach((el) => payload(el, controller));

			const observer = new MutationObserver((mutations) => {
				mutations.forEach(({ addedNodes }) =>
					addedNodes.forEach((node) => payload(node, controller)),
				);
			});

			observer.observe(_nd.body, {
				childList: true,
			});

			document.addEventListener("DOMContentLoaded", () => {
				observer.disconnect();
				controller.close();
			});
		},
	});

	return {
		stream,
		opts,
		routeCache,
	};
};

const payload = (el: Element | Node, ctrl: ReadableStreamDefaultController) => {
	const data = el instanceof Element && el.innerHTML;
	if (!data) return;
	ctrl.enqueue(Uint8Array.from(data.split(",") as any));
};

export const ctx = {
	navigate: null as unknown as (_loc: any, revalidate?: boolean) => any,
};

async function callServer(id: string, args: any) {
	const actionOpts = args[args.length - 1];
	const target = window.location.pathname + window.location.search;
	if (actionOpts?.href === target && actionOpts?.stale) {
		actionOpts.href = undefined;
	}

	const nextLocation = actionOpts?.href ?? target;

	const response = fetch("/_action", {
		method: "POST",
		headers: {
			Accept: "application/x-ndjson",
			"rsc-action": id,
			"rsc-location": nextLocation,
		},
		body: await encodeReply(args),
	});

	const result = await createFromFetch<{ root?: any; returnValue: any }>(
		response,
		opts,
	);

	if (result.root) {
		routeCache.clear();
		routeCache.set(nextLocation, result.root);
		ctx.navigate(nextLocation);
	}

	return result.returnValue;
}

export function Shell({
	data,
	navigate,
}: { data: any | Promise<any>; navigate: any }) {
	useEffect(() => {
		ctx.navigate = navigate;
	}, [navigate]);

	return data instanceof Promise ? use(data) : data;
}

declare global {
	let _nd: Document;
	let _FBK: undefined | ((props: FallbackProps) => JSX.Element);
}
