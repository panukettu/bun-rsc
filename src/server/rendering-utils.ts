import { Readable } from "node:stream";
import type { ReadableStreamDefaultReader } from "node:stream/web";
import { dev } from "src/build/app-config";
import { did } from "src/build/configs-build";
import type { BuildContext, RSCPayload } from "./types";
export const toNode = (stream: any) => Readable.fromWeb(stream);
export function injectHTML(
	enqueue: EncQueue,
	root: string,
	target: string,
	chunk: any,
	before: any[],
	after: any[],
) {
	try {
		const decoder = new TextDecoder();
		const str = decoder.decode(chunk);
		if (str.includes(`["$","${root}"`)) {
			const id = str.slice(0, 2);
			if (!id) return;

			const arr: RSCPayload = JSON.parse(str.slice(2));

			const children =
				"root" in arr ? (arr.root as RSCPayload)[3].children : arr[3].children;
			const index = children.findIndex((c) => c[1] === target);

			if (index === -1) return;

			children[index][3].children = before
				.concat(children[index][3].children)
				.concat(after);

			enqueue(`${id + JSON.stringify(arr)}\n`);
			return true;
		}
	} catch (e) {
		console.log(e);
	}
}

export function injectFiles(enqueue: EncQueue, files: string[]) {
	enqueue(files.join());
	return true;
}

type EncQueue = (str: any) => void;

export const getInjectables = (ctx: BuildContext) => {
	const _css = ctx.css.map((href) => {
		if (
			process.env.APP_PUBLIC_ENV === "development" &&
			!href.includes("main.css")
		) {
			const cssId = Bun.file(href).lastModified.toString(36);
			return `/${href}${did(cssId)}`;
		}

		return `/${href}`;
	});
	const preloads = _css.map<any[]>((href) => createLink(href, "preload"));

	const files = [];
	if (ctx.fallback) {
		files.push(createFile("1A5", ctx.fallback, "Fallback"));
	}

	const styles = _css.flatMap((href) => {
		const css = createLink(href, "stylesheet");
		if (dev && href.includes("?") && href.includes("main.css"))
			return [css, createLink(href.split("?")[0], "stylesheet")];
		return [css];
	});

	return {
		preloads,
		styles,
		files,
	};
};

const createLink = (
	href: string,
	rel: "stylesheet" | "preload" | "modulepreload",
) => {
	const as = rel === "preload" ? "style" : undefined;
	const fetchPriority = rel === "modulepreload" ? "low" : undefined;
	return ["$", "link", rel + href, { rel, href, as, fetchPriority }];
};
const createFile = (reactId: string, location: string, exportName: string) =>
	`${reactId}:I["${location}","${exportName}"]\n`;
