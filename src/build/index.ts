import { type Transpiler } from "bun";
import { build } from "tsup";
import type { ClientFiles } from "../server/types";
import { pkgRoot, root } from "./app-config";
import {
	type PackageFiles,
	clientConfig,
	getPackageFiles,
} from "./configs-build";
export const buildPages = async (watch?: boolean) => {
	const pkg = getPackageFiles(pkgRoot);
	const pages = [...new Bun.Glob("./src/pages/**/*.tsx").scanSync()];

	console.log(`Building ${pages.length} pages`);

	const transpiler = new Bun.Transpiler({
		target: "browser",
		loader: "tsx",
		tsconfig: await import(`${root}/tsconfig.json`),
		trimUnusedImports: true,
	});

	const entrypoints = (
		await Promise.all(pages.map((p) => getClientFiles(pkg, transpiler, p)))
	)
		.flat()
		.concat(pkg.bootstrap);

	await buildPage(entrypoints, watch);
};

const getClientFiles = async (
	pkg: PackageFiles,
	transpiler: Transpiler,
	location: string,
) => {
	let page = location
		.split("src/pages")[1]
		.split(".")[0]
		.split("/")
		.filter((p) => p !== "index")
		.join("/");

	if (page === "") page = "/";

	const result: ClientFiles = [];

	await scanImportsForClientComponents(
		transpiler,
		location,
		page,
		new Set<string>(),
		result,
		pkg.components(page),
	);

	return result;
};

const getPaths = (path: string, cwd?: string) => {
	let result = `file://${import.meta.resolveSync(path, cwd)}`;

	if (result.includes("node_modules") || !result.startsWith(`file://${root}`)) {
		result = path;
	}
	return {
		input: result,
		output: result.replace(`file://${root}/src/`, "").split(".")[0],
	};
};

const scanImportsForClientComponents = async (
	transpiler: Transpiler,
	path: string,
	page: string,
	visited: Set<string>,
	result: ClientFiles,
	components: ReturnType<PackageFiles["components"]>,
) => {
	try {
		const file = Bun.file(path);

		if (!(await file.exists())) return;

		if (path.includes("pages") && path.includes(".css")) {
			const paths = getPaths(path);
			result.push({
				inputPath: paths.input,
				outputPath: paths.output,
				fileName: path.split("/").pop() ?? "",
				page,
				css: true,
			});
		}

		if (!path.includes(".ts")) return;

		if (path.includes("fallback")) {
			const paths = getPaths(path);

			result.push({
				inputPath: paths.input,
				outputPath: paths.output,
				fileName: path.split("/").pop()?.replace(".tsx", "") ?? "",
				fallback: true,
				exportNames: ["Fallback"],
				page: page.replace(/\/?fallback/, "") || "/",
			});
		}

		const text = await file.text();

		for (const imported of transpiler.scanImports(text)) {
			if (visited.has(imported.path) || imported.path === "react") continue;

			visited.add(imported.path);

			const kind = imported.kind;

			if (
				kind === "import-statement" ||
				kind === "dynamic-import" ||
				kind === "require-resolve" ||
				kind === "require-call"
			) {
				const comp = components.find((c) => imported.path === c.outputPath);
				if (comp) {
					result.push(comp);
					continue;
				}

				const { pathname, href } = Bun.pathToFileURL(
					import.meta.resolveSync(imported.path, path),
				);
				const textContent = await Bun.file(pathname).text();

				if (textContent.includes("use client")) {
					const existing = result.find((r) => r.inputPath === href);
					if (existing) {
						const importNames = getImports(imported.path, text);
						if (existing.exportNames) {
							existing.exportNames.push(...importNames);
						} else {
							existing.exportNames = importNames;
						}
						continue;
					}
					const paths = getPaths(imported.path, path);
					result.push({
						inputPath: paths.input,
						outputPath: paths.output,
						lib:
							pathname.includes("node_modules") || !pathname.startsWith(root),
						fileName: pathname.split("/").pop()?.replace(".tsx", "") ?? "",
						exportNames: getImports(imported.path, text),
						page,
					});
				}

				await scanImportsForClientComponents(
					transpiler,
					pathname,
					page,
					visited,
					result,
					components,
				);
			}
		}
	} catch (e) {
		console.error(e);
	}
};

export const buildPage = async (entrypoints: ClientFiles, watch?: boolean) => {
	console.log(`Bundling ${entrypoints.length} client files`);
	try {
		await build(clientConfig(entrypoints, watch));
	} catch (e) {
		console.error("build error", e);
	}
};

const getImports = (path: string, document: string) => {
	const namedRegexp = new RegExp(
		`import\\s+.*?{(.*?)}\\s+from\\s+["\']${path}["\']`,
	);
	const defaultRegexp = new RegExp(
		`import\\s+(\\w+).*?\\s+from\\s+["\']${path}["\']`,
	);

	const namedMatches = namedRegexp.exec(document);
	const defaultMatches = defaultRegexp.exec(document);

	if (!namedMatches?.length && !defaultMatches?.length) {
		return [];
	}
	const result = namedMatches?.[1].split(",").map((item) => item.trim()) || [];
	if (defaultMatches?.length) {
		result.push("default");
	}
	return result;
};
