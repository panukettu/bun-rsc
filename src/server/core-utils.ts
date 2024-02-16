import { existsSync } from "node:fs";
import {
	registerClientReference,
	registerServerReference,
} from "react-server-dom/server.node";
import { dev, root, staticOut, tmpPath } from "../build/app-config";
import { did } from "../build/configs-build";
import type { Resolved, Route } from "../client/types";
import type { ClientFiles } from "./types";

export const getParentLayout = async (url: string): Promise<Route<any>> => {
	const importPath = url.split("/").slice(0, -1).join("/");
	const indexPath = `${importPath}/index`;

	if (existsSync(importPath)) {
		const module = await import(indexPath);
		if (!module.Layout) {
			return getParentLayout(importPath);
		}

		const path = indexPath.replace(`${root}/src/pages`, "");
		const location = path.replace("/index", "").replace(".tsx", "");

		return {
			Layout: module.Layout,
			Props: module.Props,
			ctx: location === "" ? "/" : location,
		};
	}

	throw new Error("No layout found");
};

export const resolveProps = async <T extends Route>(
	props: T,
): Promise<Resolved<T>> => {
	if (Object.values(props).some((v) => v instanceof Promise)) {
		const awaitedProps = await Promise.all(
			Object.entries(props).map(
				async (item) =>
					[
						item[0] as keyof typeof props,
						item[1] instanceof Promise ? await item[1] : item[1],
					] as const,
			),
		);
		return Object.fromEntries(awaitedProps) as Resolved<T>;
	}

	return props;
};

export const getBuildContext = async (
	pages: Set<string | null | undefined>,
) => {
	try {
		const built = await import(`${tmpPath}/build-manifest.json`);
		const files: any[] = built.modules.filter(
			(f: any) =>
				!f.initializer && !f.dynamic && (pages.has(f.page) || f.page === "*"),
		);

		const css = files
			.filter((f) => f.chunks.some((c: string) => c.includes(".css")))
			.map((f) => `/${f.chunks.find((c: string) => c.includes(".css"))}`)
			.concat(files.filter((f) => f.css).map((f) => f.chunks[0]));

		await Promise.all([
			registerClientFiles(files),
			registerServerActions(pages),
		]);

		const defaultFallback = built.modules.find(
			(f: any) => f.fallback && (f.page === "*" || f.page === "/"),
		);
		const fallback = files.filter((f: any) => {
			const pagesSorted = [...pages].sort(
				(a, b) => a?.length ?? 0 - (b?.length ?? 0),
			);
			return f.fallback && pagesSorted.some((p) => f.page === p);
		});

		const selectedFallback = fallback.length
			? fallback[fallback.length - 1]
			: defaultFallback;

		return {
			css: [
				...new Set(
					css.concat(built.bootstrap.css).filter((s) => !s.startsWith("/")),
				),
			],
			modules: built.bootstrap.js,
			fallback: selectedFallback.chunks[0].replace(`${staticOut}/`, ""),
		};
	} catch (e) {
		console.log(e);
		throw e;
	}
};

const registerClientFiles = async (files: ClientFiles) => {
	const cacheId = dev
		? Bun.file(`${tmpPath}/build-manifest.json`).lastModified.toString(36)
		: "";

	const promises = files.map(async (item) => {
		if (item.fallback) return;
		const importPath = item.lib ? item.outputPath : item.inputPath;
		const module = await import(importPath);

		for (const key in module) {
			const component = module[key];
			if (typeof component !== "function" || !key.match(/^[A-Z]/)) continue;

			const referencePath = `${item.outputPath}.js${did(cacheId)}`;

			if (!Object.getOwnPropertyDescriptor(component, "$$id")) {
				Object.defineProperty(component, "$$id", {
					value: referencePath,
					writable: true,
					enumerable: false,
					configurable: true,
				});
			}

			registerClientReference(component, referencePath, key, item.lib, root);
		}
	});

	await Promise.all(promises);
};

type ServerActionMeta = {
	id: string;
	path: string;
	fileName: string;
	exportNames: string[];
};

const registerServerActions = async (
	_pages: Set<string | null | undefined>,
) => {
	const actions = [
		...new Bun.Glob("src/**/*.{ts,tsx}").scanSync({ absolute: true }),
	];

	const promises = actions.map(async (path) => {
		const file = await Bun.file(path).text();

		if (!file.includes("use server")) return null;

		const regex = new RegExp(
			"export.+function\\s+(\\w+)\\(.*?\\n.*?use server",
			"g",
		);

		const module = await import(path);
		const id = path.replace(`${root}/src/`, "").split(".")[0];

		const exports = [];
		let match: RegExpExecArray | null = null;
		while ((match = regex.exec(file))) {
			if (typeof module[match[1]] !== "function") continue;

			const functionName = match[1];
			exports.push(functionName);
			registerServerReference(module[functionName], id, functionName);
		}

		return {
			id: path.replace(`${root}/src/`, "").split(".")[0],
			path: path,
			fileName:
				path
					.split("/")
					.pop()
					?.replace(/.ts[x?]/, "") ?? "",
			exportNames: exports,
		};
	});

	return (await Promise.all(promises)).filter((f): f is ServerActionMeta =>
		Boolean(f),
	);
};

export const parsePaths = (base: string, route: `/${string}`) => {
	const routeName = route.slice(1) || "index";
	const indexPath = base + routeName;

	if (
		!existsSync(`${indexPath}.tsx`) &&
		!existsSync(`${indexPath}/index.tsx`)
	) {
		const paths = [""].concat(routeName.split("/"));

		for (let i = paths.length - 1; i >= 0; i--) {
			const path = paths
				.slice(0, i + 1)
				.join("/")
				.replace("//", "/");

			if (paths[i].endsWith(".css")) continue;

			const searchPath = (base + path).replace("//", "/");

			const actualRoute = (
				path.includes("index") ? path.replace("index", "") : path
			) as `/${string}`;
			if (existsSync(`${searchPath}.tsx`)) {
				return {
					route: actualRoute,
					indexPath: searchPath,
					routeName: path,
					params: paths.slice(i + 1),
				};
			}
			if (existsSync(`${searchPath}/index.tsx`)) {
				return {
					route: actualRoute,
					indexPath: `${searchPath}/index`,
					routeName: paths[i],
					params: paths.slice(i + 1),
				};
			}
		}
		throw new Error(`No route exists for ${route}`);
	}

	return {
		route,
		indexPath,
		routeName,
		params: [],
	};
};

export const handleSearchParams = (search?: Record<string, any>) => {
	if (!search) return null;
	if (dev && search) {
		return Object.fromEntries(
			Object.entries(search || {})
				.filter(([_k]) => _k !== "_r")
				.map(([_k, v]) => {
					return [_k, v?.indexOf("_r") !== -1 ? v?.split("?")[0] : v];
				}),
		);
	}

	return search;
};
